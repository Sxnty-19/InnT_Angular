import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Documento {
  private apiUrl = 'https://inntech-backend.onrender.com/documentos';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getDocumentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_documentos_completo`, { headers: this.getHeaders() });
  }

  crearDocumento(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_documento`, payload, { headers: this.getHeaders() });
  }
}