import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

@Component({
  selector: 'app-c-informaciont',
  imports: [Footer, Navbar, NavbarA, CommonModule],
  templateUrl: './c-informaciont.html',
  styleUrl: './c-informaciont.css',
})
export class CInformaciont implements OnInit {

  private readonly API = 'https://turismo-sm.onrender.com';

  // Datos
  eventos:   any[] = [];
  lugares:   any[] = [];
  servicios: any[] = [];

  // Estados de carga
  loading = { eventos: true, lugares: true, servicios: true };
  error:   { eventos: string | null; lugares: string | null; servicios: string | null } =
           { eventos: null, lugares: null, servicios: null };

  // Tab activa
  currentCategory: 'eventos' | 'lugares' | 'servicios' = 'eventos';

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarLugares();
    this.cargarServicios();
  }

  // ========================
  // Helper campo ES/EN
  // ========================
  getField(item: any, esKey: string, enKey: string): string {
    return item[esKey] ?? item[enKey] ?? '-';
  }

  // ========================
  // Carga genérica con reintentos
  // ========================
  private async cargarData(
    endpoint: string,
    category: 'eventos' | 'lugares' | 'servicios'
  ): Promise<any[]> {
    this.loading[category] = true;
    this.error[category] = null;

    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await fetch(`${this.API}/${endpoint}/`);

        if (res.ok) {
          const data = await res.json();
          this.loading[category] = false;
          return data;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          throw new Error(`Error HTTP ${res.status}. No se pudo conectar.`);
        }

      } catch (e) {
        if (i === MAX_RETRIES - 1) {
          console.error(`Error al cargar ${category}:`, e);
          this.error[category] = `No se pudieron cargar los ${category}.`;
          this.loading[category] = false;
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    this.loading[category] = false;
    return [];
  }

  async cargarEventos(): Promise<void> {
    this.eventos = await this.cargarData('evento', 'eventos');
  }

  async cargarLugares(): Promise<void> {
    this.lugares = await this.cargarData('lugar', 'lugares');
  }

  async cargarServicios(): Promise<void> {
    this.servicios = await this.cargarData('servicio', 'servicios');
  }
}