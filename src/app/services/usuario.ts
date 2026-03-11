import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private apiUrl = 'https://innt-fastapi.onrender.com/usuarios';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getUsuarioToken() {
    return this.http.get(`${this.apiUrl}/r-token`, { headers: this.getHeaders() });
  }

  updateUsuario(data: any) {
    return this.http.patch(`${this.apiUrl}/u`, data, { headers: this.getHeaders() });
  }
}