import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

interface Room {
  id: number;
  nombre: string;
  raw: any;
}

interface Reserva {
  id_reserva: number;
  date_start: string;
  date_end: string;
}

@Component({
  selector: 'app-c-reservar',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './c-reservar.html',
  styleUrl: './c-reservar.css',
})
export class CReservar implements OnInit {

  // ========================
  // Estado de tabs
  // ========================
  activeTab: 'crear' | 'activas' = 'crear';

  // ========================
  // Estado de reserva
  // ========================
  date_start = '';
  date_end = '';
  availRooms: Room[] = [];
  selectedRooms: Room[] = [];
  reservasActivas: Reserva[] = [];

  user: any = null;
  isLoading = false;

  // ========================
  // Notificaciones
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  private notifTimeout: any;

  // ========================
  // Modal cancelación
  // ========================
  isConfirmingCancel = false;
  reservationToCancel: Reserva | null = null;

  private readonly API = 'https://inntech-backend.onrender.com';

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.user = JSON.parse(userString);
        this.cargarReservas();
      } catch (e) {
        console.error('Error al parsear el usuario de localStorage:', e);
      }
    }
  }

  // ========================
  // Notificaciones
  // ========================
  hideNotification(): void {
    this.showMessage = false;
    this.message = '';
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
  }

  showNotification(msg: string, success: boolean): void {
    this.hideNotification();
    this.isSuccess = success;
    this.message = msg;
    this.showMessage = true;
    this.notifTimeout = setTimeout(() => this.hideNotification(), 4000);
  }

  // ========================
  // Cargar reservas activas
  // ========================
  async cargarReservas(): Promise<void> {
    if (!this.user?.id_usuario) return;
    try {
      const res = await fetch(`${this.API}/reservas/activas/${this.user.id_usuario}`);
      const data = await res.json();
      this.reservasActivas = res.ok ? data.data : [];
    } catch (e) {
      console.error('Error al cargar reservas:', e);
      this.reservasActivas = [];
    }
  }

  // ========================
  // Buscar habitaciones
  // ========================
  async buscarHabitaciones(): Promise<void> {
    this.hideNotification();
    this.availRooms = [];
    this.isLoading = true;

    if (!this.date_start || !this.date_end) {
      this.showNotification('Seleccione fecha inicio y fecha fin.', false);
      this.isLoading = false;
      return;
    }

    if (new Date(this.date_end) <= new Date(this.date_start)) {
      this.showNotification('La fecha fin debe ser mayor que la fecha inicio.', false);
      this.isLoading = false;
      return;
    }

    try {
      const res = await fetch(
        `${this.API}/habitaciones/habitaciones_disponibles?date_start=${this.date_start}&date_end=${this.date_end}`
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
      this.showNotification('No hay conexión con el servidor.', false);
    } finally {
      this.isLoading = false;
    }
  }

  // ========================
  // Selección de habitaciones
  // ========================
  isSelected(id: number): boolean {
    return this.selectedRooms.some(s => s.id === id);
  }

  agregarHab(id: number): void {
    this.hideNotification();
    const hab = this.availRooms.find(r => r.id === id);
    if (!hab) { this.showNotification('Habitación no encontrada.', false); return; }
    if (this.isSelected(id)) { this.showNotification('La habitación ya fue seleccionada.', false); return; }
    this.selectedRooms = [...this.selectedRooms, hab];
    this.showNotification(`Habitación ${hab.nombre} agregada a la selección.`, true);
  }

  quitarHab(id: number): void {
    const roomName = this.selectedRooms.find(x => x.id === id)?.nombre || 'Habitación';
    this.selectedRooms = this.selectedRooms.filter(x => x.id !== id);
    this.showNotification(`${roomName} quitada de la selección.`, false);
  }

  // ========================
  // Confirmar reserva
  // ========================
  async confirmarReserva(): Promise<void> {
    this.hideNotification();
    this.isLoading = true;

    if (!this.user) {
      this.showNotification('No autenticado. Por favor, inicie sesión.', false);
      this.isLoading = false;
      return;
    }
    if (!this.date_start || !this.date_end) {
      this.showNotification('Las fechas son obligatorias.', false);
      this.isLoading = false;
      return;
    }
    if (this.selectedRooms.length === 0) {
      this.showNotification('Debe seleccionar al menos una habitación.', false);
      this.isLoading = false;
      return;
    }

    const payload = {
      id_usuario: this.user.id_usuario,
      date_start: this.date_start,
      date_end: this.date_end,
      habitaciones: this.selectedRooms.map(s => Number(s.id)),
    };

    try {
      const res = await fetch(`${this.API}/reservas/create_with_rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        this.showNotification(data.detail || data.message || 'Error al crear la reserva.', false);
        return;
      }

      this.showNotification('¡Reserva creada exitosamente! Puedes verla en Reservas Activas.', true);
      this.selectedRooms = [];
      this.availRooms = [];
      this.date_start = '';
      this.date_end = '';
      await this.cargarReservas();

    } catch (e) {
      this.showNotification('No hay conexión con el servidor al intentar crear la reserva.', false);
    } finally {
      this.isLoading = false;
    }
  }

  // ========================
  // Modal de cancelación
  // ========================
  showCancelConfirmation(id: number): void {
    this.hideNotification();

    const reserva = this.reservasActivas.find(r => r.id_reserva === id);
    if (!reserva) {
      this.showNotification('Reserva no encontrada o ya ha sido cancelada.', false);
      return;
    }

    const diffTime = new Date(reserva.date_start).getTime() - new Date().getTime();
    if (diffTime < 24 * 60 * 60 * 1000) {
      this.showNotification(
        'Esta reserva no se puede cancelar. Debe cancelarse con al menos 24 horas de antelación.',
        false
      );
      return;
    }

    this.reservationToCancel = reserva;
    this.isConfirmingCancel = true;
  }

  async executeCancellation(): Promise<void> {
    if (!this.reservationToCancel) return;

    this.isLoading = true;
    const id = this.reservationToCancel.id_reserva;
    this.isConfirmingCancel = false;

    try {
      const res = await fetch(`${this.API}/reservas/cancelar/${id}`, { method: 'PUT' });
      const data = await res.json();

      if (!res.ok) {
        this.showNotification(data.detail || 'No se pudo cancelar la reserva.', false);
        return;
      }

      this.showNotification('Reserva cancelada exitosamente.', true);
      await this.cargarReservas();

    } catch (e) {
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
}