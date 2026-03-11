import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

interface TipoDocumento {
  id_tdocumento: number;
  nombre: string;
  descripcion: string;
}

interface Documento {
  id_documento: number;
  tipo_documento: string;
  numero_documento: string;
  lugar_expedicion: string;
  nombre_completo: string;
  estado: number;
  date_created: string;
}

@Component({
  selector: 'app-a-documentos',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-documentos.html',
  styleUrl: './a-documentos.css',
})
export class ADocumentos implements OnInit {

  constructor(private cd: ChangeDetectorRef) { }

  private readonly BASE = 'https://inntech-backend.onrender.com';

  // ========================
  // Datos
  // ========================
  tipos: TipoDocumento[] = [];
  documentos: Documento[] = [];
  loadingTipos = true;
  loadingDocumentos = true;
  error: string | null = null;

  // ========================
  // Form nuevo tipo
  // ========================
  nuevoTipo = { nombre: '', descripcion: '' };
  isSubmitting = false;

  // ========================
  // Vista activa
  // ========================
  activeView: 'tipos' | 'documentos' = 'tipos';

  // ========================
  // Toast
  // ========================
  message = '';
  isSuccess = false;
  showMessage = false;
  isModalActive = false;
  private toastTimeout: any;
  private fadeTimeout: any;

  // ========================
  // ngOnInit — equivale a onMount
  // ========================
  ngOnInit(): void {
    this.cargarTipos();
    this.cargarDocumentos();
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
    if (this.showMessage) await this.hideMessageWithTransition(100);

    this.message = text;
    this.isSuccess = type === 'success';
    this.showMessage = true;
    this.isModalActive = true;

    this.toastTimeout = setTimeout(() => {
      this.hideMessageWithTransition(300);
    }, 4000);
  }

  // ========================
  // fetchWithRetry — equivale a fetchWithRetry() con backoff exponencial
  // ========================
  private async fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Error HTTP! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached');
  }

  // ========================
  // Cargar tipos de documento
  // ========================
  async cargarTipos(): Promise<void> {
    this.loadingTipos = true;
    try {
      const res = await this.fetchWithRetry(`${this.BASE}/tipos_documento/get_tipos_documento`);
      const data = await res.json();
      if (!data.success) throw new Error(data.detail ?? 'Error al obtener tipos');
      this.tipos = data.data || [];
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error cargando tipos:', err);
      this.error = 'No se pudieron cargar los tipos de documento.';
      this.cd.detectChanges();
    } finally {
      this.loadingTipos = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Cargar documentos completos
  // ========================
  async cargarDocumentos(): Promise<void> {
    this.loadingDocumentos = true;
    try {
      const res = await this.fetchWithRetry(`${this.BASE}/documentos/get_documentos_completo`);
      const data = await res.json();
      if (!data.success) throw new Error(data.detail ?? 'Error al obtener documentos');
      this.documentos = data.data || [];
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error cargando documentos:', err);
      this.error = 'No se pudieron cargar los documentos registrados.';
      this.cd.detectChanges();
    } finally {
      this.loadingDocumentos = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Crear tipo de documento — equivale a crearTipo()
  // ========================
  async crearTipo(): Promise<void> {
    if (!this.nuevoTipo.nombre || !this.nuevoTipo.descripcion) {
      this.showFloatingMessage('error', 'Por favor, complete todos los campos para el nuevo tipo.');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      const res = await this.fetchWithRetry(
        `${this.BASE}/tipos_documento/create_tipo_documento`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.nuevoTipo),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.detail ?? 'El tipo ya existe o hubo un error en el servidor.');
      }

      this.showFloatingMessage('success', `Tipo '${this.nuevoTipo.nombre}' creado con éxito.`);
      this.limpiarNuevo();
      await this.cargarTipos();

    } catch (err: any) {
      console.error('Error al crear tipo:', err);
      this.showFloatingMessage('error', err.message || 'Error al crear el tipo de documento. Intente de nuevo.');
    } finally {
      this.isSubmitting = false;
      this.cd.detectChanges();
    }
  }

  limpiarNuevo(): void {
    this.nuevoTipo = { nombre: '', descripcion: '' };
  }

  // ========================
  // countDocumentsByType — equivale a countDocumentsByType()
  // ========================
  countDocumentsByType(nombreTipo: string): number {
    if (!this.documentos?.length) return 0;
    return this.documentos.filter(d => d.tipo_documento === nombreTipo).length;
  }

  // ========================
  // Formatear fecha — equivale a new Date().toLocaleDateString('es-CO')
  // ========================
  formatFecha(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO');
  }
}