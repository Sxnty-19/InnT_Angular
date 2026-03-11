import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Reserva } from '../../services/reserva';

interface ItemHistorial {
  id_reserva: number;
  date_start: string;
  date_end: string;
  estado: string;
}

@Component({
  selector: 'app-c-reservas-h',
  imports: [Footer, Navbar, NavbarA, CommonModule],
  templateUrl: './c-reservas-h.html',
  styleUrl: './c-reservas-h.css',
})
export class CReservasH implements OnInit {

  id_usuario: number | null = null;
  fullName = '';
  rol = '';

  historial: ItemHistorial[] = [];
  error = '';
  isLoading = true;
  isLoaded = false;

  constructor(private cd: ChangeDetectorRef, private reservaService: Reserva) { }

  ngOnInit(): void {
    const id_usuario = localStorage.getItem('id_usuario');
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');

    if (id_usuario && nombre && rol) {
      this.id_usuario = Number(id_usuario);
      this.fullName = nombre;
      this.rol = rol;
      this.cargarHistorial();
    } else {
      this.error = 'No se encontró información de usuario.';
      this.isLoading = false;
      this.cd.detectChanges();
    }
  }

  cargarHistorial(): void {
    if (!this.id_usuario) return;

    this.isLoading = true;
    this.error = '';

    this.reservaService.getHistorial(this.id_usuario).subscribe({
      next: (data) => {
        this.historial = data.data || [];
        if (this.historial.length === 0) {
          this.error = 'No tienes reservas finalizadas.';
        }
        this.isLoaded = true;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar historial.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}