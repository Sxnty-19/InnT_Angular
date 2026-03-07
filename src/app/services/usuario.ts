import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private apiUrl = 'https://innt-fastapi.onrender.com/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarioToken() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
    return this.http.get(`${this.apiUrl}/r-token`, { headers });
  }

  updateUsuario(data: any) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
    return this.http.patch(`${this.apiUrl}/u`, data, { headers });
  }
}