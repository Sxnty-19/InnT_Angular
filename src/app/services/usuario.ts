import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private apiUrl = 'https://innt-fastapi.onrender.com/usuarios';
  private apiUrl2 = 'https://inntech-backend.onrender.com/usuarios';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  // =========================
  // Obtener usuarios
  // =========================
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl2}/get_usuarios`, {
      headers: this.getHeaders()
    });
  }

  // =========================
  // Activar usuario
  // =========================
  activarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl2}/activar/${id}`, {}, {
      headers: this.getHeaders()
    });
  }

  // =========================
  // Desactivar usuario
  // =========================
  desactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl2}/desactivar/${id}`, {}, {
      headers: this.getHeaders()
    });
  }

  // =========================
  // Cambiar rol
  // =========================
  cambiarRol(idUsuario: number, idRol: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl2}/cambiar-rol/${idUsuario}/${idRol}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUsuarioToken() {
    return this.http.get(`${this.apiUrl}/r-token`, { headers: this.getHeaders() });
  }

  updateUsuario(data: any) {
    return this.http.patch(`${this.apiUrl}/u`, data, { headers: this.getHeaders() });
  }
}