import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuloRol {

  private apiUrl = 'https://innt-fastapi.onrender.com/modulos-roles';

  constructor(private http: HttpClient) { }

  getModulos(): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
    return this.http.get(`${this.apiUrl}/r-modulos-rol`, { headers });
  }
}