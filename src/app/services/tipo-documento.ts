import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumento {
  private apiUrl = 'https://inntech-backend.onrender.com/tipos_documento';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getTiposDocumento(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_tipos_documento`, { headers: this.getHeaders() });
  }

  crearTipoDocumento(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_tipo_documento`, payload, { headers: this.getHeaders() });
  }
}