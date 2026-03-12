import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Habitacion {
  private apiUrl = 'https://inntech-backend.onrender.com/habitaciones';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  // ========================
  // Obtener habitaciones
  // ========================
  getHabitaciones(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/get_habitaciones`,
      { headers: this.getHeaders() }
    );
  }

  // ========================
  // Crear habitación
  // ========================
  createHabitacion(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create_habitacion`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ========================
  // Actualizar estado
  // ========================
  updateEstado(numero: string, estado: number): Observable<any> {

    const formData = new FormData();
    formData.append('numero', numero);
    formData.append('estado', estado.toString());

    return this.http.put(
      `${this.apiUrl}/actualizar_estado`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  // ========================
  // Buscar habitaciones disponibles
  // ========================
  buscarHabitacionesDisponibles(date_start: string, date_end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitaciones_disponibles?date_start=${date_start}&date_end=${date_end}`, { headers: this.getHeaders() });
  }
}
