import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  fullName: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Tomamos el nombre completo directamente del localStorage
    const nombre = localStorage.getItem('nombre');
    if (nombre) {
      this.fullName = nombre;
    }
  }

  irPrincipal(): void {
    this.router.navigate(['/principal']);
  }

  editarPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.irPrincipal();
    }
  }
}
/*
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  fullName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Tomamos el nombre completo directamente del localStorage
    const nombre = localStorage.getItem('nombre');
    if (nombre) {
      this.fullName = nombre;
    }
  }

  irPrincipal(): void {
    this.router.navigate(['/principal']);
  }

  editarPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.irPrincipal();
    }
  }
}
*/