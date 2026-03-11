import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

interface HabDisponible {
  id: number;
  nombre: string;
  raw: any;
}

interface Reserva {
  id_reserva: number;
  id_usuario: number;
  date_start: string;
  date_end: string;
  estado: number;
}

@Component({
  selector: 'app-a-reservas',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-reservas.html',
  styleUrl: './a-reservas.css',
})
export class AReservas implements OnInit {

  private readonly BASE = 'https://inntech-backend.onrender.com';

  // ========================
  // Navegación
  // ========================
  activeTab: 'crear' | 'listado' = 'crear';

  // ========================
  // Estado de carga
  // ========================
  isLoading = false;
  isSubmitting = false;
  loadingListado = true;

  // ========================
  // Datos
  // ========================
  id_usuario = '';
  date_start = '';
  date_end = '';
  availRooms: HabDisponible[] = [];
  selectedRooms: HabDisponible[] = [];
  reservas: Reserva[] = [];

  // ========================
  // Toast
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  private toastTimeout: any;

  // ========================
  // Modal cancelación
  // ========================
  isConfirmingCancel = false;
  reservationToCancel: Reserva | null = null;

  // ========================
  // ngOnInit — equivale a onMount
  // ========================
  ngOnInit(): void {
    this.cargarReservas();
  }

  // ========================
  // Toast — equivale a showNotification / hideNotification
  // ========================
  hideNotification(): void {
    this.showMessage = false;
    this.message = '';
  }

  showNotification(msg: string, success: boolean): void {
    this.hideNotification();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.isSuccess = success;
    this.message = msg;
    this.showMessage = true;
    this.toastTimeout = setTimeout(() => this.hideNotification(), 4000);
  }

  // ========================
  // Cargar TODAS las reservas — equivale a cargarReservas()
  // ========================
  async cargarReservas(): Promise<void> {
    this.loadingListado = true;
    try {
      const res = await fetch(`${this.BASE}/reservas/get_reservas`);
      const data = await res.json();
      this.reservas = res.ok ? (data.data || []) : [];
    } catch (e) {
      console.error('Error al cargar todas las reservas:', e);
      this.reservas = [];
      this.showNotification('Error de conexión al cargar el listado.', false);
    } finally {
      this.loadingListado = false;
    }
  }

  // ========================
  // Buscar habitaciones disponibles
  // ========================
  async buscarHabitaciones(): Promise<void> {
    this.hideNotification();
    this.availRooms = [];
    this.isLoading = true;

    try {
      if (!this.date_start || !this.date_end) {
        this.showNotification('Seleccione fecha inicio y fecha fin.', false);
        return;
      }
      if (new Date(this.date_end) <= new Date(this.date_start)) {
        this.showNotification('La fecha fin debe ser posterior a la fecha inicio.', false);
        return;
      }

      const res = await fetch(
        `${this.BASE}/habitaciones/habitaciones_disponibles?date_start=${this.date_start}&date_end=${this.date_end}`
      );
      const data = await res.json();

      if (!res.ok) {
        this.showNotification(data.detail || 'Error al buscar habitaciones.', false);
        return;
      }

      this.availRooms = data.data.map((h: any) => ({
        id: h.id_habitacion ?? h.id ?? h.id_h,
        nombre: h.nombre ?? h.numero ?? `#${h.id_habitacion ?? h.id ?? h.id_h}`,
        raw: h,
      }));

      if (this.availRooms.length === 0) {
        this.showNotification('No hay habitaciones disponibles en esas fechas.', false);
      } else {
        this.showNotification(`Se encontraron ${this.availRooms.length} habitaciones disponibles.`, true);
      }
    } catch (e) {
      console.error(e);
      this.showNotification('No hay conexión con el servidor.', false);
    } finally {
      this.isLoading = false;
    }
  }

  // ========================
  // Agregar / Quitar habitación
  // ========================
  agregarHab(id: number): void {
    this.hideNotification();
    const hab = this.availRooms.find(r => r.id === id);
    if (!hab) { this.showNotification('Habitación no encontrada.', false); return; }
    if (this.selectedRooms.some(s => s.id === hab.id)) {
      this.showNotification('La habitación ya fue seleccionada.', false); return;
    }
    this.selectedRooms = [...this.selectedRooms, hab];
    this.showNotification(`Habitación ${hab.nombre} agregada.`, true);
  }

  quitarHab(id: number): void {
    const roomName = this.selectedRooms.find(x => x.id === id)?.nombre || 'Habitación';
    this.selectedRooms = this.selectedRooms.filter(x => x.id !== id);
    this.showNotification(`${roomName} quitada.`, false);
  }

  isSelected(id: number): boolean {
    return this.selectedRooms.some(s => s.id === id);
  }

  // ========================
  // Confirmar reserva ADMIN — equivale a confirmarReserva()
  // ========================
  async confirmarReserva(): Promise<void> {
    this.hideNotification();
    this.isSubmitting = true;

    if (!this.id_usuario || isNaN(Number(this.id_usuario))) {
      this.showNotification('Debe digitar un ID de usuario válido.', false);
      this.isSubmitting = false; return;
    }
    if (!this.date_start || !this.date_end) {
      this.showNotification('Las fechas son obligatorias.', false);
      this.isSubmitting = false; return;
    }
    if (new Date(this.date_end) <= new Date(this.date_start)) {
      this.showNotification('Fecha fin debe ser posterior a fecha inicio.', false);
      this.isSubmitting = false; return;
    }
    if (this.selectedRooms.length === 0) {
      this.showNotification('Debe seleccionar al menos una habitación.', false);
      this.isSubmitting = false; return;
    }

    const payload = {
      id_usuario: Number(this.id_usuario),
      date_start: this.date_start,
      date_end: this.date_end,
      habitaciones: this.selectedRooms.map(s => Number(s.id)),
    };

    try {
      const res = await fetch(`${this.BASE}/reservas/create_with_rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        this.showNotification(data.detail || data.message || 'Error al crear la reserva.', false);
        return;
      }

      this.showNotification(`¡Reserva #${data.id_reserva || 'Nueva'} creada exitosamente!`, true);
      // Limpiar y recargar — igual que Svelte
      this.id_usuario = '';
      this.date_start = '';
      this.date_end = '';
      this.selectedRooms = [];
      this.availRooms = [];
      await this.cargarReservas();
    } catch (e) {
      console.error(e);
      this.showNotification('No hay conexión con el servidor al intentar crear la reserva.', false);
    } finally {
      this.isSubmitting = false;
    }
  }

  // ========================
  // Modal cancelación — equivale a showCancelConfirmation / executeCancellation / cancelConfirmation
  // ========================
  showCancelConfirmation(id: number): void {
    this.hideNotification();
    const reserva = this.reservas.find(r => r.id_reserva === id);
    if (!reserva) { this.showNotification('Reserva no encontrada.', false); return; }
    if (reserva.estado !== 1) { this.showNotification('La reserva ya está cancelada.', false); return; }
    this.reservationToCancel = reserva;
    this.isConfirmingCancel = true;
  }

  async executeCancellation(): Promise<void> {
    if (!this.reservationToCancel) return;
    this.isLoading = true;
    const id = this.reservationToCancel.id_reserva;
    this.isConfirmingCancel = false; // Cierra modal inmediatamente igual que Svelte

    try {
      const res = await fetch(`${this.BASE}/reservas/cancelar/${id}`, { method: 'PUT' });
      const data = await res.json();

      if (!res.ok) {
        this.showNotification(data.detail || 'No se pudo cancelar la reserva.', false);
        return;
      }

      this.showNotification('Reserva cancelada exitosamente.', true);
      await this.cargarReservas();
    } catch {
      this.showNotification('Error de conexión al intentar cancelar la reserva.', false);
    } finally {
      this.isLoading = false;
      this.reservationToCancel = null;
    }
  }

  cancelConfirmation(): void {
    this.isConfirmingCancel = false;
    this.reservationToCancel = null;
    this.showNotification('Cancelación detenida.', false);
  }

  // ========================
  // Helpers
  // ========================
  getReservasActivas(): number {
    return this.reservas.filter(r => r.estado === 1).length;
  }
}