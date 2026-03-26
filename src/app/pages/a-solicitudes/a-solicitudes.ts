import { Component, ChangeDetectorRef } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Solicitud } from '../../services/solicitud';
import { Notificacion } from '../../interfaces/notificacion';

@Component({
  selector: 'app-a-solicitudes',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-solicitudes.html',
  styleUrl: './a-solicitudes.css',
})
export class ASolicitudes {
  notificaciones: Notificacion[] = [];
  loading = true;
  error: string | null = null;
  isSubmitting = false;
  activeView: 'create' | 'history' = 'create';

  numero_habitacion = '';
  descripcion = '';

  id_usuario: number | null = null;

  message = '';
  isSuccess = false;
  showMessage = false;
  isModalActive = false;
  private toastTimeout: any;
  private fadeTimeout: any;

  constructor(private cd: ChangeDetectorRef, private solicitudService: Solicitud) { }

  ngOnInit(): void {
    this.id_usuario = Number(localStorage.getItem('id_usuario'));
    this.cargarNotificaciones();
  }

  hideMessageWithTransition(duration = 300): Promise<void> {
    this.isModalActive = false;
    return new Promise(resolve => {
      this.fadeTimeout = setTimeout(() => {
        this.showMessage = false;
        resolve();
      }, duration);
    });
  }

  showFloatingMessage(type: 'success' | 'error', text: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);

    if (this.showMessage) {
      this.hideMessageWithTransition(100);
    }

    this.message = text;
    this.isSuccess = type === 'success';
    this.showMessage = true;
    this.isModalActive = true;

    this.toastTimeout = setTimeout(() => { this.hideMessageWithTransition(300); }, 4000);
  }

  cargarNotificaciones(): void {

    this.loading = true;
    this.error = null;

    this.solicitudService.getNotificaciones().subscribe({

      next: (data: any) => {
        this.notificaciones = data.data.sort(
          (a: Notificacion, b: Notificacion) =>
            b.id_notificacion - a.id_notificacion
        );
        this.loading = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las notificaciones.';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  crearNotificacion(): void {

    if (!this.numero_habitacion || !this.descripcion) {
      this.showFloatingMessage('error', 'Complete el número de habitación y la descripción.');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.solicitudService.crearNotificacion({
      id_usuario: this.id_usuario!,
      numero_habitacion: this.numero_habitacion,
      descripcion: this.descripcion,
      estado: 1
    }).subscribe({

      next: () => {
        this.showFloatingMessage('success', `Solicitud para Habitación ${this.numero_habitacion} creada con éxito.`);
        this.numero_habitacion = '';
        this.descripcion = '';
        this.cargarNotificaciones();
        this.activeView = 'history';
        this.isSubmitting = false;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error(err);
        this.showFloatingMessage('error', 'Error al crear la solicitud.');
        this.isSubmitting = false;
        this.cd.detectChanges();
      }
    });
  }
}