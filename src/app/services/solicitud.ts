import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Solicitud {
  private apiUrl = 'https://inntech-backend.onrender.com/notificaciones';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_notificaciones`, { headers: this.getHeaders() });
  }

  crearNotificacion(payload: {
    id_usuario: number;
    numero_habitacion: string;
    descripcion: string;
    estado: number;
  }): Observable<any> {

    const formData = new FormData();

    formData.append('id_usuario', String(payload.id_usuario));
    formData.append('numero_habitacion', payload.numero_habitacion);
    formData.append('descripcion', payload.descripcion);
    formData.append('estado', String(payload.estado));

    return this.http.post(`${this.apiUrl}/crear_por_numero`, formData, { headers: this.getHeaders() });
  }
}