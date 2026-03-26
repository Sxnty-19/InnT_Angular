import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Habitacion as Habitacionservice } from '../../services/habitacion';
import { TipoHabitacion as TipoHabitacionService } from '../../services/tipo-habitacion';
import { Habitacion } from '../../interfaces/habitacion';
import { TipoHabitacion } from '../../interfaces/tipo-habitacion';

@Component({
  selector: 'app-a-habitaciones',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-habitaciones.html',
  styleUrl: './a-habitaciones.css',
})
export class AHabitaciones implements OnInit {

  constructor(private cd: ChangeDetectorRef, private habitacionService: Habitacionservice, private tipoHabitacionService: TipoHabitacionService) { }

  // ========================
  // Datos
  // ========================
  tipos: TipoHabitacion[] = [];
  habitaciones: Habitacion[] = [];
  loadingTipos = true;
  loadingHabitaciones = true;
  errorTipos: string | null = null;
  errorHabitaciones: string | null = null;
  isSubmittingTipo = false;
  isSubmittingHabitacion = false;

  activeView: 'tipos' | 'habitaciones' = 'tipos';

  // ========================
  // Formularios
  // ========================
  nuevoTipo = { nombre: '', descripcion: '', capacidad_max: '', estado: 1 };
  nuevaHabitacion = { id_thabitacion: '' as number | '', numero: '', estado: 1 };

  // ========================
  // Toast
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  private toastTimeout: any;

  // ========================
  // ngOnInit — equivale a onMount
  // ========================
  ngOnInit(): void {
    this.cargarTipos();
    this.cargarHabitaciones();
  }

  // ========================
  // Toast — equivale a showCustomMessage()
  // Nota: el Svelte original no tenía fade-out, solo setTimeout(showMessage=false, 4000)
  // ========================
  showCustomMessage(text: string, success: boolean): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.message = text;
    this.isSuccess = success;
    this.showMessage = true;

    this.toastTimeout = setTimeout(() => {
      this.showMessage = false;
    }, 4000);
  }

  // ========================
  // safeFetch — equivale a safeFetch()
  // ========================
  private async safeFetch(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.showCustomMessage(
          errorData.detail || `Error HTTP: ${response.status} en la acción.`,
          false
        );
        throw new Error(errorData.detail || `Error HTTP! status: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      console.error('Error en la petición:', error);
      if (!error.message?.startsWith('Error HTTP:')) {
        this.showCustomMessage('Error de conexión o servidor al intentar realizar la acción.', false);
      }
      throw error;
    }
  }

  // ========================
  // Cargar tipos de habitación
  // ========================
  cargarTipos(): void {

    this.loadingTipos = true;
    this.errorTipos = null;

    this.tipoHabitacionService.getTiposHabitacion().subscribe({

      next: (data) => {
        this.tipos = data.data || [];
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Error cargando tipos:', err);
        this.errorTipos = 'No se pudieron cargar los tipos de habitación.';
        this.cd.detectChanges();
      },

      complete: () => {
        this.loadingTipos = false;
        this.cd.detectChanges();
      }

    });
  }

  // ========================
  // Cargar habitaciones
  // ========================
  cargarHabitaciones(): void {

    this.loadingHabitaciones = true;
    this.errorHabitaciones = null;

    this.habitacionService.getHabitaciones().subscribe({

      next: (data) => {
        this.habitaciones = data.data || [];
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.errorHabitaciones = 'No se pudieron cargar las habitaciones.';
        this.cd.detectChanges();
      },

      complete: () => {
        this.loadingHabitaciones = false;
        this.cd.detectChanges();
      }

    });
  }

  // ========================
  // Guardar tipo — equivale a guardarTipo()
  // ========================
  guardarTipo(): void {

    if (!this.nuevoTipo.nombre || !this.nuevoTipo.capacidad_max) {
      this.showCustomMessage('Por favor, complete el nombre y la capacidad máxima.', false);
      return;
    }

    if (this.isSubmittingTipo) return;

    this.isSubmittingTipo = true;

    this.tipoHabitacionService.createTipoHabitacion(this.nuevoTipo).subscribe({

      next: () => {

        this.showCustomMessage(
          `Tipo "${this.nuevoTipo.nombre}" creado exitosamente.`,
          true
        );

        this.nuevoTipo = {
          nombre: '',
          descripcion: '',
          capacidad_max: '',
          estado: 1
        };

        this.cargarTipos();
      },

      error: (err) => {
        console.error('Error creando tipo:', err);
        this.showCustomMessage('Error al crear el tipo de habitación.', false);
      },

      complete: () => {
        this.isSubmittingTipo = false;
        this.cd.detectChanges();
      }

    });
  }

  // ========================
  // Guardar habitación — equivale a guardarHabitacion()
  // ========================
  guardarHabitacion(): void {

    if (!this.nuevaHabitacion.id_thabitacion || !this.nuevaHabitacion.numero) {
      this.showCustomMessage('Por favor, seleccione el tipo y el número de habitación.', false);
      return;
    }

    if (this.isSubmittingHabitacion) return;

    this.isSubmittingHabitacion = true;

    this.habitacionService.createHabitacion(this.nuevaHabitacion).subscribe({

      next: () => {

        this.showCustomMessage(`Habitación ${this.nuevaHabitacion.numero} registrada.`, true);

        this.nuevaHabitacion = {
          id_thabitacion: '',
          numero: '',
          estado: 1
        };

        this.cargarHabitaciones();
      },

      error: (err) => {
        console.error('Error creando habitación:', err);
        this.showCustomMessage('Error al registrar la habitación.', false);
      },

      complete: () => {
        this.isSubmittingHabitacion = false;
        this.cd.detectChanges();
      }

    });
  }

  // ========================
  // Toggle estado habitación — equivale a toggleEstado()
  // Usa FormData igual que el original
  // ========================
  toggleEstado(h: Habitacion): void {

    const nuevo = h.estado === 1 ? 0 : 1;
    const nuevoEstadoTexto = nuevo === 1 ? 'LIMPIA' : 'SUCIA';

    this.habitacionService.updateEstado(h.numero, nuevo).subscribe({

      next: () => {

        this.showCustomMessage(
          `Habitación ${h.numero} marcada como ${nuevoEstadoTexto}.`,
          true
        );

        this.cargarHabitaciones();
      },

      error: (err) => {
        console.error('Error actualizando estado:', err);
        this.showCustomMessage('Error al actualizar el estado.', false);
      }

    });
  }

  // ========================
  // Helper: nombre del tipo para la tabla de habitaciones
  // equivale al {#each tipos as t}{#if t.id_thabitacion === h.id_thabitacion}{t.nombre}{/if}{/each}
  // ========================
  getNombreTipo(id_thabitacion: number): string {
    return this.tipos.find(t => t.id_thabitacion === id_thabitacion)?.nombre ?? '—';
  }

  // ========================
  // Helper stat header
  // ========================
  getTiposActivos(): number {
    return this.tipos.filter(t => t.estado === 1).length;
  }

  getHabitacionesLimpias(): number {
    return this.habitaciones.filter(h => h.estado === 1).length;
  }
}