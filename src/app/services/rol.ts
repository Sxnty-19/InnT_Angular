import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Rol {
  private apiUrl = 'https://inntech-backend.onrender.com/roles';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  // ========================
  // Obtener roles (combo)
  // ========================
  getRoles(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/combo`,
      { headers: this.getHeaders() }
    );
  }
}
