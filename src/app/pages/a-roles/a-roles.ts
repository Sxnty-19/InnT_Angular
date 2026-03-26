import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Rol } from '../../interfaces/rol';
import { Modulo } from '../../interfaces/modulo';
import { ModuloAsignado } from '../../interfaces/modulo-asignado';

@Component({
  selector: 'app-a-roles',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-roles.html',
  styleUrl: './a-roles.css',
})
export class ARoles implements OnInit {

  constructor(private cd: ChangeDetectorRef) { }

  private readonly BASE = 'https://inntech-backend.onrender.com';

  // ========================
  // Datos
  // ========================
  roles: Rol[] = [];
  modulos: Modulo[] = [];
  assignedModules: ModuloAsignado[] = [];

  // ========================
  // Estados UI
  // ========================
  cargandoRoles = false;
  cargandoModulos = false;
  cargandoAsignados = false;
  creandoRol = false;
  assigningBusy = false;
  errorMsg = '';

  // ========================
  // Form nuevo rol
  // ========================
  nuevoRol = { nombre: '', descripcion: '', estado: 1 };

  // ========================
  // Modales
  // ========================
  showCreateModal = false;
  showAssignModal = false;
  currentRole: Rol | null = null;
  selectedModuloToAssign: number | null = null;

  // Modal confirmación
  showConfirmModal = false;
  confirmMessage = '';
  confirmAction: () => void = () => { };

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
    Promise.all([this.cargarRoles(), this.cargarModulos()]);
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
  // Cargar roles
  // ========================
  async cargarRoles(): Promise<void> {
    this.cargandoRoles = true;
    this.errorMsg = '';
    try {
      const res = await fetch(`${this.BASE}/roles/get_roles`);
      const data = await res.json();
      this.roles = data.data && Array.isArray(data.data) ? data.data : [];
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error cargando roles:', err);
      this.errorMsg = 'Error cargando roles (ver consola).';
      this.showFloatingMessage('error', 'No se pudieron cargar los roles.');
      this.cd.detectChanges();
    } finally {
      this.cargandoRoles = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Cargar módulos disponibles
  // ========================
  async cargarModulos(): Promise<void> {
    this.cargandoModulos = true;
    try {
      const res = await fetch(`${this.BASE}/modulos/get_modulos`);
      const data = await res.json();
      this.modulos = data.data && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error('Error cargando módulos:', err);
      this.modulos = [];
      this.showFloatingMessage('error', 'No se pudieron cargar los módulos disponibles.');
    } finally {
      this.cargandoModulos = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Cargar módulos asignados al rol
  // ========================
  async cargarModulosAsignados(id_rol: number): Promise<void> {
    this.cargandoAsignados = true;
    this.assignedModules = [];
    try {
      const res = await fetch(`${this.BASE}/modulos_roles/get_modulos_by_rol/${id_rol}`);
      const data = await res.json();
      this.assignedModules = data.data && Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error('Error cargando módulos asignados:', err);
      this.assignedModules = [];
      this.showFloatingMessage('error', 'Error cargando módulos asignados al rol.');
    } finally {
      this.cargandoAsignados = false;
      this.cd.detectChanges();
    }
  }

  // ========================
  // Crear rol
  // ========================
  async crearRol(): Promise<void> {
    if (!this.nuevoRol.nombre.trim()) {
      this.showFloatingMessage('error', 'El nombre del rol es obligatorio.');
      return;
    }

    this.creandoRol = true;
    if (this.showMessage) await this.hideMessageWithTransition(100);

    try {
      const res = await fetch(`${this.BASE}/roles/create_rol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.nuevoRol),
      });
      const data = await res.json();

      if (!res.ok) {
        this.showFloatingMessage('error', data.detail || data.message || 'Error al crear rol');
      } else {
        this.showFloatingMessage('success', `Rol "${this.nuevoRol.nombre}" creado con éxito.`);
        this.showCreateModal = false;
        this.limpiarNuevoRol();
        await this.cargarRoles();
      }
    } catch (err) {
      console.error('Error creando rol:', err);
      this.showFloatingMessage('error', 'Error creando rol (ver consola).');
    } finally {
      this.creandoRol = false;
      this.cd.detectChanges();
    }
  }

  limpiarNuevoRol(): void {
    this.nuevoRol = { nombre: '', descripcion: '', estado: 1 };
  }

  // ========================
  // Toggle estado rol — abre confirm modal primero
  // ========================
  handleToggleEstado(rol: Rol): void {
    const confirmMsg = rol.estado === 1
      ? `¿Seguro que quieres DESACTIVAR el rol "${rol.nombre}"? Esto afectará a los usuarios asignados.`
      : `¿Seguro que quieres ACTIVAR el rol "${rol.nombre}"?`;

    this.confirmMessage = confirmMsg;
    this.confirmAction = async () => {
      this.showConfirmModal = false;
      await this.toggleEstadoRol(rol);
    };
    this.showConfirmModal = true;
  }

  async toggleEstadoRol(rol: Rol): Promise<void> {
    const url = rol.estado === 1
      ? `${this.BASE}/roles/desactivar/${rol.id_rol}`
      : `${this.BASE}/roles/activar/${rol.id_rol}`;

    try {
      const res = await fetch(url, { method: 'PUT' });
      const data = await res.json();

      if (!res.ok) {
        this.showFloatingMessage('error', data.detail || data.message || 'Error al cambiar estado');
      } else {
        this.showFloatingMessage(
          'success',
          `Estado del rol "${rol.nombre}" cambiado a ${rol.estado === 1 ? 'Inactivo' : 'Activo'}.`
        );
        await this.cargarRoles();
        this.cd.detectChanges();
      }
    } catch (err) {
      console.error('Error toggleEstadoRol:', err);
      this.showFloatingMessage('error', 'Error al cambiar estado (ver consola).');
    }
  }

  // ========================
  // Modal asignar módulos
  // ========================
  abrirModalAsignar(rol: Rol): void {
    this.currentRole = rol;
    this.selectedModuloToAssign = null;
    this.assignedModules = [];
    this.showAssignModal = true;
    this.cargarModulosAsignados(rol.id_rol);
  }

  // Equivale a handleAsignarModulo() — abre confirm antes de asignar
  handleAsignarModulo(): void {
    if (!this.currentRole) return;
    if (!this.selectedModuloToAssign) {
      this.showFloatingMessage('error', 'Selecciona un módulo para asignar.');
      return;
    }

    const moduloNombre = this.modulos.find(m => m.id_modulo == this.selectedModuloToAssign)?.nombre || 'Módulo Desconocido';

    this.confirmMessage = `¿Seguro que deseas ASIGNAR el módulo "${moduloNombre}" al rol "${this.currentRole.nombre}"?`;
    this.confirmAction = async () => {
      this.showConfirmModal = false;
      await this.asignarModulo();
    };
    this.showConfirmModal = true;
  }

  async asignarModulo(): Promise<void> {
    if (!this.currentRole || !this.selectedModuloToAssign) return;

    this.assigningBusy = true;
    const moduloNombre = this.modulos.find(m => m.id_modulo == this.selectedModuloToAssign)?.nombre || 'Módulo Desconocido';
    if (this.showMessage) await this.hideMessageWithTransition(100);

    try {
      const payload = {
        id_modulo: +this.selectedModuloToAssign,
        id_rol: +this.currentRole.id_rol,
        estado: 1,
      };

      const res = await fetch(`${this.BASE}/modulos_roles/create_modulorol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        this.showFloatingMessage('error', data.detail || data.message || 'Error al asignar módulo');
      } else {
        this.showFloatingMessage('success', `Módulo "${moduloNombre}" asignado con éxito a ${this.currentRole.nombre}.`);
        await this.cargarModulosAsignados(this.currentRole.id_rol);
        this.selectedModuloToAssign = null;
      }
    } catch (err) {
      console.error('Error en asignarModulo:', err);
      this.showFloatingMessage('error', 'Error al asignar módulo (ver consola).');
    } finally {
      this.assigningBusy = false;
      this.cd.detectChanges();
    }
  }

  getRolesActivos(): number {
    return this.roles.filter(r => r.estado === 1).length;
  }

  // Helper para el select de estado en el form
  getNuevoRolEstado(): number { return this.nuevoRol.estado; }
  setNuevoRolEstado(val: string): void { this.nuevoRol.estado = +val; }
}