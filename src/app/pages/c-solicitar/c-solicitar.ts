import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Solicitud } from '../../services/solicitud';

interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  id_habitacion: number;
  descripcion: string;
  estado: number;
  date_created: string;
}

@Component({
  selector: 'app-c-solicitar',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './c-solicitar.html',
  styleUrl: './c-solicitar.css',
})
export class CSolicitar implements OnInit {

  constructor(private cd: ChangeDetectorRef, private solicitudService: Solicitud) { }

  private readonly API = 'https://inntech-backend.onrender.com/notificaciones';

  // ========================
  // Estado general
  // ========================
  notificaciones: Notificacion[] = [];
  error = '';
  isSubmitting = false;
  activeView: 'create' | 'history' = 'create';

  // ========================
  // Formulario
  // ========================
  numeroHabitacion = '';
  descripcion = '';

  // ========================
  // Usuario
  // ========================
  user: any = null;
  fullName = '';
  rol = '';

  // ========================
  // Toast flotante
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  isModalActive = false;
  private toastTimeout: any;
  private fadeTimeout: any;

  // ========================
  // ngOnInit — equivale a código top-level + onMount
  // ========================
  ngOnInit(): void {
    const id_usuario = localStorage.getItem('id_usuario');
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');

    if (id_usuario) {
      this.user = {
        id_usuario: Number(id_usuario)
      };
      this.fullName = nombre ?? '';
      this.rol = rol ?? '';
    }
    this.cargarNotificaciones();
  }

  // ========================
  // Toast — equivale a showFloatingMessage / hideMessageWithTransition
  // ========================
  hideMessageWithTransition(duration = 300): Promise<void> {
    this.isModalActive = false;
    return new Promise(resolve => {
      if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
      this.fadeTimeout = setTimeout(() => {
        this.showMessage = false;
        resolve();
      }, duration);
    });
  }

  async showFloatingMessage(type: 'success' | 'error', text: string): Promise<void> {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    if (this.showMessage) {
      await this.hideMessageWithTransition(100);
    }

    this.message = text;
    this.isSuccess = type === 'success';
    this.showMessage = true;
    this.isModalActive = true;

    this.toastTimeout = setTimeout(() => {
      this.hideMessageWithTransition(300);
    }, 4000);
  }

  // ========================
  // Cargar notificaciones — equivale a cargarNotificaciones()
  // ========================
  cargarNotificaciones(): void {

    if (!this.user) return;

    this.solicitudService
      .getNotificacionesUsuario(this.user.id_usuario)
      .subscribe({

        next: (data) => {

          this.notificaciones = (data.data || []).sort(
            (a: Notificacion, b: Notificacion) =>
              b.id_notificacion - a.id_notificacion
          );

          this.cd.detectChanges();
        },

        error: (err) => {

          console.error(err);

          this.error = 'Error al cargar notificaciones.';
          this.notificaciones = [];

          this.cd.detectChanges();
        }

      });

  }

  // ========================
  // Crear notificación — equivale a crearNotificacion()
  // ========================
  async crearNotificacion(): Promise<void> {

    if (!this.user) {
      this.showFloatingMessage(
        'error',
        'No se encontró sesión activa. Por favor, inicia sesión.'
      );
      return;
    }

    if (!this.numeroHabitacion || !this.descripcion) {
      this.showFloatingMessage(
        'error',
        'Por favor, complete el número de habitación y la descripción.'
      );
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.error = '';

    const payload = {
      id_usuario: this.user.id_usuario,
      numero_habitacion: this.numeroHabitacion,
      descripcion: this.descripcion,
      estado: 1
    };

    this.solicitudService.crearNotificacion(payload).subscribe({

      next: async (data) => {

        if (!data.success) {

          this.showFloatingMessage(
            'error',
            data.detail ?? 'Error al crear notificación.'
          );

          return;
        }

        this.showFloatingMessage(
          'success',
          `Notificación creada correctamente para Habitación ${this.numeroHabitacion}!`
        );

        this.numeroHabitacion = '';
        this.descripcion = '';

        this.cargarNotificaciones();

        this.activeView = 'history';
      },

      error: () => {

        this.error = 'Error de conexión con el servidor.';

        this.showFloatingMessage(
          'error',
          'Error de conexión con el servidor. Intente de nuevo.'
        );
      },

      complete: () => {
        this.isSubmitting = false;
        this.cd.detectChanges();
      }

    });

  }
}