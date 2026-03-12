import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Habitacion as HabitacionService } from '../../services/habitacion';

interface Habitacion {
  numero: number;
  id_thabitacion: string;
  estado: number; // 0 = Sucia, 1 = Limpia
}

@Component({
  selector: 'app-l-habitaciones',
  imports: [Footer, Navbar, NavbarA, CommonModule],
  templateUrl: './l-habitaciones.html',
  styleUrl: './l-habitaciones.css',
})
export class LHabitaciones implements OnInit {

  constructor(private cd: ChangeDetectorRef, private habitacionService: HabitacionService) { }

  // ========================
  // Estado
  // ========================
  habitaciones: Habitacion[] = [];
  loading = true;
  error: string | null = null;

  // ========================
  // Toast
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  private toastTimeout: any;

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  getPendientes(): number {
    return this.habitaciones.filter(h => h.estado === 0).length;
  }

  // ========================
  // Notificación — equivale a showNotification()
  // ========================
  showNotification(msg: string, success: boolean, duration = 3000): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.showMessage = false; // Forzar reinicio de animación
    this.message = msg;
    this.isSuccess = success;

    // Pequeño delay para que Angular detecte el cambio y relance la animación
    setTimeout(() => {
      this.showMessage = true;
      this.toastTimeout = setTimeout(() => {
        this.showMessage = false;
      }, duration);
    }, 50);
  }

  // ========================
  // Cargar habitaciones — equivale a cargarHabitaciones()
  // ========================
  cargarHabitaciones(): void {

    this.loading = true;
    this.error = null;

    this.habitacionService.getHabitaciones().subscribe({

      next: (data) => {

        if (!data.success) {
          throw new Error(data.detail ?? 'Error al cargar.');
        }

        this.habitaciones = data.data.sort(
          (a: Habitacion, b: Habitacion) => a.estado - b.estado
        );

        this.cd.detectChanges();
      },

      error: (err) => {

        console.error(err);

        this.error =
          'No se pudieron cargar las habitaciones. Verifique la conexión al servidor.';

        this.showNotification(this.error, false, 4000);

        this.cd.detectChanges();
      },

      complete: () => {
        this.loading = false;
        this.cd.detectChanges();
      }

    });

  }

  // ========================
  // Marcar limpia — equivale a marcarLimpia()
  // ========================
  marcarLimpia(numero: number): void {

    this.habitacionService.updateEstado(String(numero), 1).subscribe({

      next: (data) => {

        if (!data.success) {

          console.error('Error del servidor al actualizar:', data.detail);

          this.showNotification(
            `Error al marcar habitación ${numero}: ${data.detail || 'Fallo desconocido.'}`,
            false,
            4000
          );

          return;
        }

        this.habitaciones = this.habitaciones
          .map(h => h.numero === numero ? { ...h, estado: 1 } : h)
          .sort((a, b) => a.estado - b.estado);

        this.cd.detectChanges();

        this.showNotification(
          `Habitación ${numero} marcada como limpia con éxito.`,
          true,
          3000
        );

      },

      error: (err) => {

        console.error(err);

        this.showNotification(
          'Error de conexión. Inténtalo de nuevo más tarde.',
          false,
          4000
        );

      }

    });

  }
}