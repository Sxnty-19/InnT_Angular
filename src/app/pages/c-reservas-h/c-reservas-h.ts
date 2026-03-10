import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

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

  user: any = null;
  fullName = '';
  rol = '';

  historial: ItemHistorial[] = [];
  error = '';
  isLoading = true;
  isLoaded = false;

  private readonly API = 'https://inntech-backend.onrender.com';

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);

        const p1 = this.user.primer_nombre    || '';
        const p2 = this.user.segundo_nombre   ? ` ${this.user.segundo_nombre}`   : '';
        const a1 = this.user.primer_apellido   || '';
        const a2 = this.user.segundo_apellido  ? ` ${this.user.segundo_apellido}` : '';
        this.fullName = `${p1}${p2} ${a1}${a2}`.replace(/\s+/g, ' ').trim();
        this.rol = this.user.rol;

        this.cargarHistorial();
      } catch (e) {
        console.error('Error al parsear el usuario de localStorage:', e);
        this.error = 'No se encontró información de usuario.';
        this.isLoading = false;
      }
    } else {
      this.error = 'No se encontró información de usuario.';
      this.isLoading = false;
    }
  }

  async cargarHistorial(): Promise<void> {
    if (!this.user) return;

    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await fetch(
          `${this.API}/reservas/terminadas/${this.user.id_usuario}`
        );
        const data = await res.json();

        if (res.ok) {
          this.historial = data.data;
          if (this.historial.length === 0) {
            this.error = 'No tienes reservas finalizadas.';
          }
          this.isLoaded = true;
          this.isLoading = false;
          return;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          this.error = data.detail ?? 'Error al cargar historial después de varios intentos.';
        }

      } catch (e) {
        if (i === MAX_RETRIES - 1) {
          this.error = 'Error de conexión al servidor.';
        } else {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    this.isLoading = false;
  }
}