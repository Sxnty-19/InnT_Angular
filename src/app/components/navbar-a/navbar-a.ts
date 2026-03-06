import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ModuloRol } from '../../services/modulo-rol';

@Component({
  selector: 'app-navbar-a',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-a.html',
  styleUrl: './navbar-a.css',
})
export class NavbarA {

  modulos: any[] = [];
  error: string = '';
  isLoading: boolean = true;
  isMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private moduloRolService: ModuloRol,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarModulos();
  }

  cargarModulos(): void {

    this.moduloRolService.getModulos().subscribe({

      next: (data) => {
        this.modulos = data.data;
        this.error = '';
        this.isLoading = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        this.error = err.error?.detail || 'Error al cargar los módulos';
        this.isLoading = false;
        this.cd.detectChanges();
      }

    });

  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ir(ruta: string): void {

    this.router.navigate([ruta]);

    if (window.matchMedia('(max-width:768px)').matches) {
      this.isMenuOpen = false;
    }

  }
}