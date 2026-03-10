import { Component, OnInit } from '@angular/core';
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

  private readonly API = 'https://inntech-backend.onrender.com/notificaciones';

  // Estado general
  notificaciones: Notificacion[] = [];
  loading = true;
  error: string | null = null;
  isSubmitting = false;
  activeView: 'create' | 'history' = 'create';

  // Formulario
  numero_habitacion = '';
  descripcion = '';

  // Usuario
  user: any = null;
  id_usuario: number | null = null;

  // Toast
  message = '';
  isSuccess = false;
  showMessage = false;
  isModalActive = false;
  private toastTimeout: any;
  private fadeTimeout: any;

  ngOnInit(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        this.user = JSON.parse(stored);
        this.id_usuario = this.user.id_usuario;
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
    this.cargarNotificaciones();
  }

  // ========================
  // Toast
  // ========================
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
    if (this.fadeTimeout)  clearTimeout(this.fadeTimeout);

    if (this.showMessage) {
      this.hideMessageWithTransition(100);
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
  // Cargar notificaciones
  // ========================
  async cargarNotificaciones(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res = await fetch(`${this.API}/get_notificaciones`);

      if (!res.ok) throw new Error('Error cargando notificaciones');

      const data = await res.json();

      if (!data.success) throw new Error(data.detail ?? 'Error');

      // Ordenar por id descendente (más recientes primero)
      this.notificaciones = data.data.sort(
        (a: Notificacion, b: Notificacion) => b.id_notificacion - a.id_notificacion
      );
    } catch (e) {
      console.error(e);
      this.error = 'No se pudieron cargar las notificaciones.';
    } finally {
      this.loading = false;
    }
  }

  // ========================
  // Crear notificación
  // ========================
  async crearNotificacion(): Promise<void> {
    if (!this.numero_habitacion || !this.descripcion) {
      this.showFloatingMessage('error', 'Complete el número de habitación y la descripción.');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.error = null;

    if (this.showMessage) await this.hideMessageWithTransition(100);

    try {
      const formData = new FormData();
      formData.append('id_usuario',        String(this.id_usuario));
      formData.append('numero_habitacion', this.numero_habitacion);
      formData.append('descripcion',       this.descripcion);
      formData.append('estado',            '1');

      const res = await fetch(`${this.API}/crear_por_numero`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail ?? 'Error al crear notificación');
      }

      this.showFloatingMessage('success', `Solicitud para Habitación ${this.numero_habitacion} creada con éxito.`);
      this.numero_habitacion = '';
      this.descripcion = '';

      await this.cargarNotificaciones();
      this.activeView = 'history';

    } catch (e) {
      console.error('Error al crear notificación:', e);
      this.showFloatingMessage('error', 'Error al crear la solicitud. Verifique los datos.');
    } finally {
      this.isSubmitting = false;
    }
  }
}