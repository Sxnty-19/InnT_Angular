import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Reserva {
  private apiUrl = 'https://inntech-backend.onrender.com/reservas';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getReservas(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/get_reservas`,
      { headers: this.getHeaders() }
    );
  }

  getReservasActivas(id_usuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/activas/${id_usuario}`, { headers: this.getHeaders() });
  }

  crearReserva(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_with_rooms`, payload, { headers: this.getHeaders() });
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${id}`, {}, { headers: this.getHeaders() });
  }

  getHistorial(id_usuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/terminadas/${id_usuario}`, { headers: this.getHeaders() });
  }
}