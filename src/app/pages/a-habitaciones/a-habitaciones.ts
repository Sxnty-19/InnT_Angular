import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

interface TipoHabitacion {
  id_thabitacion: number;
  nombre: string;
  descripcion: string;
  capacidad_max: number;
  estado: number;
}

interface Habitacion {
  id_habitacion: number;
  id_thabitacion: number;
  numero: string;
  estado: number;
}

@Component({
  selector: 'app-a-habitaciones',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-habitaciones.html',
  styleUrl: './a-habitaciones.css',
})
export class AHabitaciones implements OnInit {

  constructor(private cd: ChangeDetectorRef) { }

  private readonly BASE = 'https://inntech-backend.onrender.com';

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
  async cargarTipos(): Promise<void> {
    this.loadingTipos = true;
    this.errorTipos = null;
    try {
      const data = await this.safeFetch(`${this.BASE}/tipos_habitacion/get_tipos_habitacion`);
      this.tipos = data.data || [];
      this.cd.detectChanges();
    } catch {
      this.errorTipos = 'No se pudieron cargar los tipos de habitación.';
      this.cd.detectChanges();
    } finally {
      this.loadingTipos = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Cargar habitaciones
  // ========================
  async cargarHabitaciones(): Promise<void> {
    this.loadingHabitaciones = true;
    this.errorHabitaciones = null;
    try {
      const data = await this.safeFetch(`${this.BASE}/habitaciones/get_habitaciones`);
      this.habitaciones = data.data || [];
      this.cd.detectChanges();
    } catch {
      this.errorHabitaciones = 'No se pudieron cargar las habitaciones.';
      this.cd.detectChanges();
    } finally {
      this.loadingHabitaciones = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Guardar tipo — equivale a guardarTipo()
  // ========================
  async guardarTipo(): Promise<void> {
    if (!this.nuevoTipo.nombre || !this.nuevoTipo.capacidad_max) {
      this.showCustomMessage('Por favor, complete el nombre y la capacidad máxima.', false);
      return;
    }
    if (this.isSubmittingTipo) return;
    this.isSubmittingTipo = true;
    try {
      await this.safeFetch(`${this.BASE}/tipos_habitacion/create_tipo_habitacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.nuevoTipo),
      });
      this.showCustomMessage(`Tipo "${this.nuevoTipo.nombre}" creado exitosamente.`, true);
      this.nuevoTipo = { nombre: '', descripcion: '', capacidad_max: '', estado: 1 };
      await this.cargarTipos();
    } catch {
      // El mensaje de error ya se muestra en safeFetch
    } finally {
      this.isSubmittingTipo = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Guardar habitación — equivale a guardarHabitacion()
  // ========================
  async guardarHabitacion(): Promise<void> {
    if (!this.nuevaHabitacion.id_thabitacion || !this.nuevaHabitacion.numero) {
      this.showCustomMessage('Por favor, seleccione el tipo y el número de habitación.', false);
      return;
    }
    if (this.isSubmittingHabitacion) return;
    this.isSubmittingHabitacion = true;
    try {
      await this.safeFetch(`${this.BASE}/habitaciones/create_habitacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.nuevaHabitacion),
      });
      this.showCustomMessage(`Habitación ${this.nuevaHabitacion.numero} registrada.`, true);
      this.nuevaHabitacion = { id_thabitacion: '', numero: '', estado: 1 };
      await this.cargarHabitaciones();
    } catch {
      // El mensaje de error ya se muestra en safeFetch
    } finally {
      this.isSubmittingHabitacion = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Toggle estado habitación — equivale a toggleEstado()
  // Usa FormData igual que el original
  // ========================
  async toggleEstado(h: Habitacion): Promise<void> {
    const nuevo = h.estado === 1 ? 0 : 1;
    const nuevoEstadoTexto = nuevo === 1 ? 'LIMPIA' : 'SUCIA';

    const formData = new FormData();
    formData.append('numero', h.numero);
    formData.append('estado', nuevo.toString());

    try {
      await this.safeFetch(`${this.BASE}/habitaciones/actualizar_estado`, {
        method: 'PUT',
        body: formData,
      });
      this.showCustomMessage(`Habitación ${h.numero} marcada como ${nuevoEstadoTexto}.`, true);
      await this.cargarHabitaciones();
      this.cd.detectChanges();
    } catch {
      // El mensaje de error ya se muestra en safeFetch
    }
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