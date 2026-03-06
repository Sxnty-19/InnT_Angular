import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  fullName = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.fullName = localStorage.getItem('nombre')
      || 'Acceso Denegado (PERMISOS BLOQUEADOS)';
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