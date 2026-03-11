import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var msal: any;

@Injectable({
  providedIn: 'root',
})
export class Azure {

  private msalInstance: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {

    const msalConfig = {
      auth: {
        clientId: "19e5e926-40ac-490c-a24e-6bf35bc767f0",
        authority: "https://login.microsoftonline.com/1e9aabe8-67f8-4f1c-a329-a754e92499ae",
        redirectUri: "http://localhost:4200/login"
      }
    };
    this.msalInstance = new msal.PublicClientApplication(msalConfig);
    this.handleRedirect();
  }

  signIn() {
    this.msalInstance.loginRedirect({
      scopes: ["User.Read"]
    });
  }

  private handleRedirect() {

    this.msalInstance.handleRedirectPromise()
      .then((response: any) => {

        if (response) {

          const account = response.account;
          const correo = account.username;

          console.log("Correo Azure:", correo);

          this.loginBackend(correo);

        }
      })
      .catch((error: any) => {
        console.error("Error login Azure:", error);
      });
  }

  private loginBackend(correo: string) {

    const body = new URLSearchParams();
    body.set('correo', correo);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http.post<any>('https://innt-fastapi.onrender.com/auth/azure-login', body.toString(), { headers })
      .subscribe({

        next: (data) => {

          console.log("Respuesta backend:", data);

          localStorage.setItem('nombre', data.user.nombre);
          localStorage.setItem('id_usuario', data.user.id_usuario);
          localStorage.setItem('rol', data.user.rol);
          localStorage.setItem('id_rol', data.user.id_rol);
          localStorage.setItem('token', data.access_token);

          this.router.navigate(['/principal']);
        },

        error: (err) => {
          console.error("Error backend Azure:", err);
          alert("Usuario no registrado en el sistema");
        }
      });
  }
}