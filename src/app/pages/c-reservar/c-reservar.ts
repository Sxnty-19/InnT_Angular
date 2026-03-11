import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Reserva } from '../../services/reserva';

interface Room {
  id: number;
  nombre: string;
  raw: any;
}

interface ReservaActiva {
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

  activeTab: 'crear' | 'activas' = 'crear';
  date_start = '';
  date_end = '';
  availRooms: Room[] = [];
  selectedRooms: Room[] = [];
  reservasActivas: ReservaActiva[] = [];
  id_usuario: number | null = null;
  isLoading = false;
  message = '';
  isSuccess = false;
  showMessage = false;

  private notifTimeout: any;

  isConfirmingCancel = false;
  reservationToCancel: ReservaActiva | null = null;

  constructor(private cd: ChangeDetectorRef, private reservaService: Reserva) { }

  ngOnInit(): void {
    const id_usuario = localStorage.getItem('id_usuario');
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');

    if (id_usuario && nombre && rol) {
      this.id_usuario = Number(id_usuario);
      this.cargarReservas();
    } else {
      this.showNotification('No se encontró información de usuario.', false);
    }
  }

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
    this.cd.detectChanges();
    this.notifTimeout = setTimeout(() => this.hideNotification(), 4000);
  }

  cargarReservas(): void {

    if (!this.id_usuario) return;

    this.reservaService.getReservasActivas(this.id_usuario).subscribe({

      next: (data) => {
        this.reservasActivas = data.data || [];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.reservasActivas = [];
        this.cd.detectChanges();
      }
    });
  }

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
      this.showNotification('La fecha fin debe ser mayor que la fecha inicio.', false);
      this.isLoading = false;
      return;
    }

    this.reservaService
      .getHabitacionesDisponibles(this.date_start, this.date_end)
      .subscribe({
        next: (data) => {
          this.availRooms = data.data.map((h: any) => ({
            id: h.id_habitacion ?? h.id ?? h.id_h,
            nombre: h.nombre ?? h.numero ?? `#${h.id_habitacion ?? h.id ?? h.id_h}`,
            raw: h,
          }));

          if (this.availRooms.length === 0) {
            this.showNotification(
              'No hay habitaciones disponibles en esas fechas.',
              false
            );
          } else {
            this.showNotification(
              `Se encontraron ${this.availRooms.length} habitaciones disponibles.`,
              true
            );
          }
        },

        error: () => {
          this.showNotification('No hay conexión con el servidor.', false);
        },

        complete: () => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
  }

  isSelected(id: number): boolean {
    return this.selectedRooms.some(s => s.id === id);
  }

  agregarHab(id: number): void {
    this.hideNotification();
    const hab = this.availRooms.find(r => r.id === id);

    if (!hab) {
      this.showNotification('Habitación no encontrada.', false);
      return;
    }

    if (this.isSelected(id)) {
      this.showNotification('La habitación ya fue seleccionada.', false);
      return;
    }

    this.selectedRooms = [...this.selectedRooms, hab];

    this.showNotification(
      `Habitación ${hab.nombre} agregada a la selección.`,
      true
    );
  }

  quitarHab(id: number): void {
    const roomName = this.selectedRooms.find(x => x.id === id)?.nombre || 'Habitación';
    this.selectedRooms = this.selectedRooms.filter(x => x.id !== id);
    this.showNotification(`${roomName} quitada de la selección.`, false);
  }

  confirmarReserva(): void {

    this.hideNotification();
    this.isLoading = true;

    if (!this.id_usuario) {
      this.showNotification(
        'No autenticado. Por favor, inicie sesión.',
        false
      );
      this.isLoading = false;
      return;
    }

    if (!this.date_start || !this.date_end) {
      this.showNotification('Las fechas son obligatorias.', false);
      this.isLoading = false;
      return;
    }

    if (this.selectedRooms.length === 0) {
      this.showNotification(
        'Debe seleccionar al menos una habitación.',
        false
      );
      this.isLoading = false;
      return;
    }

    const payload = {
      id_usuario: this.id_usuario,
      date_start: this.date_start,
      date_end: this.date_end,
      habitaciones: this.selectedRooms.map(s => Number(s.id)),
    };

    this.reservaService.crearReserva(payload).subscribe({

      next: () => {
        this.showNotification(
          '¡Reserva creada exitosamente! Puedes verla en Reservas Activas.',
          true
        );

        this.selectedRooms = [];
        this.availRooms = [];
        this.date_start = '';
        this.date_end = '';

        this.cargarReservas();
      },

      error: () => {
        this.showNotification('Error al crear la reserva.', false);
      },

      complete: () => {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  showCancelConfirmation(id: number): void {

    this.hideNotification();

    const reserva = this.reservasActivas.find(r => r.id_reserva === id);

    if (!reserva) {
      this.showNotification(
        'Reserva no encontrada o ya ha sido cancelada.',
        false
      );
      return;
    }

    const diffTime =
      new Date(reserva.date_start).getTime() -
      new Date().getTime();

    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (diffTime < twentyFourHours) {
      this.showNotification(
        'Debe cancelar con al menos 24 horas de anticipación.',
        false
      );
      return;
    }
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
        this.showNotification(
          'Reserva cancelada exitosamente.',
          true
        );
        this.cargarReservas();
      },

      error: () => {
        this.showNotification(
          'Error de conexión al intentar cancelar la reserva.',
          false
        );
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

    this.showNotification(
      'Cancelación detenida.',
      false
    );
  }
}