import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuloRol {

  private apiUrl = 'http://127.0.0.1:8000/modulos-roles';

  constructor(private http: HttpClient) { }

  getModulos(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/r-modulos-rol`, { headers });
  }
}