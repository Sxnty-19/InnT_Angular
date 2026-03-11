import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuloRol {
  private apiUrl = 'https://innt-fastapi.onrender.com/modulos-roles';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  getModulos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rol/`, { headers: this.getHeaders() });
  }
}