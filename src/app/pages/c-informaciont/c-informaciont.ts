import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Express } from '../../services/express';

@Component({
  selector: 'app-c-informaciont',
  imports: [Footer, Navbar, NavbarA, CommonModule],
  templateUrl: './c-informaciont.html',
  styleUrl: './c-informaciont.css',
})
export class CInformaciont implements OnInit {
  eventos: any[] = [];
  lugares: any[] = [];
  servicios: any[] = [];

  loading = { eventos: true, lugares: true, servicios: true };
  error: { eventos: string | null; lugares: string | null; servicios: string | null } =
    { eventos: null, lugares: null, servicios: null };

  currentCategory: 'eventos' | 'lugares' | 'servicios' = 'eventos';

  constructor(private cd: ChangeDetectorRef, private expressService: Express) { }

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarLugares();
    this.cargarServicios();
  }

  getField(item: any, esKey: string, enKey: string): string {
    return item[esKey] ?? item[enKey] ?? '-';
  }

  cargarEventos(): void {

    this.loading.eventos = true;
    this.error.eventos = null;

    this.expressService.getEventos().subscribe({

      next: (data) => {
        this.eventos = data;
        this.loading.eventos = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.error.eventos = 'No se pudieron cargar los eventos.';
        this.loading.eventos = false;
        this.cd.detectChanges();
      }

    });

  }

  cargarLugares(): void {

    this.loading.lugares = true;
    this.error.lugares = null;

    this.expressService.getLugares().subscribe({

      next: (data) => {
        this.lugares = data;
        this.loading.lugares = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.error.lugares = 'No se pudieron cargar los lugares.';
        this.loading.lugares = false;
        this.cd.detectChanges();
      }
    });
  }

  cargarServicios(): void {

    this.loading.servicios = true;
    this.error.servicios = null;

    this.expressService.getServicios().subscribe({

      next: (data) => {
        this.servicios = data;
        this.loading.servicios = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.error.servicios = 'No se pudieron cargar los servicios.';
        this.loading.servicios = false;
        this.cd.detectChanges();
      }
    });
  }
}