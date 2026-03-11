import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

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

  constructor(private cd: ChangeDetectorRef) { }

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
  async cargarNotificaciones(): Promise<void> {
    if (!this.user) return;

    try {
      const res = await fetch(`${this.API}/usuario/${this.user.id_usuario}`);
      const data = await res.json();

      if (!res.ok) {
        this.error = data.detail ?? 'No hay notificaciones o error al cargar.';
        this.notificaciones = [];
      } else {
        // Ordenar por id descendente — igual que Svelte
        this.notificaciones = data.data.sort(
          (a: Notificacion, b: Notificacion) => b.id_notificacion - a.id_notificacion
        );
      }
      this.cd.detectChanges();
    } catch (e) {
      this.error = 'Error al cargar notificaciones.';
      this.cd.detectChanges();
    }
  }

  // ========================
  // Crear notificación — equivale a crearNotificacion()
  // ========================
  async crearNotificacion(): Promise<void> {
    if (!this.user) {
      this.showFloatingMessage('error', 'No se encontró sesión activa. Por favor, inicia sesión.');
      return;
    }

    if (!this.numeroHabitacion || !this.descripcion) {
      this.showFloatingMessage('error', 'Por favor, complete el número de habitación y la descripción.');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.error = '';

    if (this.showMessage) await this.hideMessageWithTransition(100);

    const formData = new FormData();
    formData.append('id_usuario', String(this.user.id_usuario));
    formData.append('numero_habitacion', this.numeroHabitacion);
    formData.append('descripcion', this.descripcion);
    formData.append('estado', '1');

    try {
      const res = await fetch(`${this.API}/crear_por_numero`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        this.showFloatingMessage('error', data.detail ?? 'Error al crear notificación.');
      } else {
        this.showFloatingMessage(
          'success',
          `Notificación creada correctamente para Habitación ${this.numeroHabitacion}!`
        );
        this.numeroHabitacion = '';
        this.descripcion = '';
        await this.cargarNotificaciones();
        // Mueve a historial después de crear — igual que Svelte
        this.activeView = 'history';
      }
    } catch (e) {
      this.error = 'Error de conexión con el servidor.';
      this.showFloatingMessage('error', 'Error de conexión con el servidor. Intente de nuevo.');
    } finally {
      this.isSubmitting = false;
      this.cd.detectChanges();
    }
  }
}