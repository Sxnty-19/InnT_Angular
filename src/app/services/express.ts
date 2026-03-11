import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Express {
  private apiUrl = 'https://turismo-sm.onrender.com';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getEventos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/evento`, { headers: this.getHeaders() });
  }

  getLugares(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lugar`, { headers: this.getHeaders() });
  }

  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicio`, { headers: this.getHeaders() });
  }
}