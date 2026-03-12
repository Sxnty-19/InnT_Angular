import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Habitacion } from '../../services/habitacion';
import { Reserva as ReservaService } from '../../services/reserva';

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

  constructor(private cd: ChangeDetectorRef, private habitacionService: Habitacion, private reservaService: ReservaService) { }

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
  cargarReservas(): void {

    this.loadingListado = true;

    this.reservaService.getReservas().subscribe({

      next: (data) => {
        this.reservas = data.data || [];
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.reservas = [];
        this.showNotification('Error de conexión al cargar el listado.', false);
        this.cd.detectChanges();
      },

      complete: () => {
        this.loadingListado = false;
        this.cd.detectChanges();
      }

    });

  }

  // ========================
  // Buscar habitaciones disponibles
  // ========================
  buscarHabitaciones(): void {

    this.hideNotification();
    this.availRooms = [];
    this.isLoading = true;

    if (!this.date_start || !this.date_end) {
      this.showNotification('Seleccione fecha inicio y fecha fin.', false);
      this.isLoading = false;
      return;
    }

    if (new Date(this.date_end) <= new Date(this.date_start)) {
      this.showNotification('La fecha fin debe ser posterior a la fecha inicio.', false);
      this.isLoading = false;
      return;
    }

    this.habitacionService
      .buscarHabitacionesDisponibles(this.date_start, this.date_end)
      .subscribe({

        next: (data) => {

          this.availRooms = (data.data || []).map((h: any) => ({
            id: h.id_habitacion ?? h.id ?? h.id_h,
            nombre: h.nombre ?? h.numero ?? `#${h.id_habitacion ?? h.id ?? h.id_h}`,
            raw: h,
          }));

          if (this.availRooms.length === 0) {
            this.showNotification('No hay habitaciones disponibles en esas fechas.', false);
          } else {
            this.showNotification(
              `Se encontraron ${this.availRooms.length} habitaciones disponibles.`,
              true
            );
          }

          this.cd.detectChanges();
        },

        error: (err) => {
          console.error(err);
          this.showNotification('No hay conexión con el servidor.', false);
          this.cd.detectChanges();
        },

        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }

      });
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
    this.cd.detectChanges();
  }

  quitarHab(id: number): void {
    const roomName = this.selectedRooms.find(x => x.id === id)?.nombre || 'Habitación';
    this.selectedRooms = this.selectedRooms.filter(x => x.id !== id);
    this.showNotification(`${roomName} quitada.`, false);
    this.cd.detectChanges();
  }

  isSelected(id: number): boolean {
    return this.selectedRooms.some(s => s.id === id);
  }

  // ========================
  // Confirmar reserva ADMIN — equivale a confirmarReserva()
  // ========================
  confirmarReserva(): void {

    this.hideNotification();
    this.isSubmitting = true;

    if (!this.id_usuario || isNaN(Number(this.id_usuario))) {
      this.showNotification('Debe digitar un ID de usuario válido.', false);
      this.isSubmitting = false;
      return;
    }

    if (!this.date_start || !this.date_end) {
      this.showNotification('Las fechas son obligatorias.', false);
      this.isSubmitting = false;
      return;
    }

    if (new Date(this.date_end) <= new Date(this.date_start)) {
      this.showNotification('Fecha fin debe ser posterior a fecha inicio.', false);
      this.isSubmitting = false;
      return;
    }

    if (this.selectedRooms.length === 0) {
      this.showNotification('Debe seleccionar al menos una habitación.', false);
      this.isSubmitting = false;
      return;
    }

    const payload = {
      id_usuario: Number(this.id_usuario),
      date_start: this.date_start,
      date_end: this.date_end,
      habitaciones: this.selectedRooms.map(s => Number(s.id)),
    };

    this.reservaService.crearReserva(payload).subscribe({

      next: (data) => {

        this.showNotification(
          `¡Reserva #${data.id_reserva || 'Nueva'} creada exitosamente!`,
          true
        );

        this.id_usuario = '';
        this.date_start = '';
        this.date_end = '';
        this.selectedRooms = [];
        this.availRooms = [];

        this.cargarReservas();
      },

      error: (err) => {
        console.error(err);
        this.showNotification('Error al crear la reserva.', false);
      },

      complete: () => {
        this.isSubmitting = false;
        this.cd.detectChanges();
      }

    });

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

  executeCancellation(): void {

    if (!this.reservationToCancel) return;

    this.isLoading = true;

    const id = this.reservationToCancel.id_reserva;

    this.isConfirmingCancel = false;

    this.reservaService.cancelarReserva(id).subscribe({

      next: () => {

        this.showNotification('Reserva cancelada exitosamente.', true);

        this.cargarReservas();
      },

      error: (err) => {
        console.error(err);
        this.showNotification('Error al cancelar la reserva.', false);
      },

      complete: () => {
        this.isLoading = false;
        this.reservationToCancel = null;
        this.cd.detectChanges();
      }

    });

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