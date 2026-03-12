import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TipoHabitacion {
  private apiUrl = 'https://inntech-backend.onrender.com/tipos_habitacion';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  // ========================
  // Obtener tipos de habitación
  // ========================
  getTiposHabitacion(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/get_tipos_habitacion`,
      { headers: this.getHeaders() }
    );
  }

  // ========================
  // Crear tipo de habitación
  // ========================
  createTipoHabitacion(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create_tipo_habitacion`,
      data,
      { headers: this.getHeaders() }
    );
  }
}
