import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

interface Usuario {
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  telefono: string;
  correo: string;
  username: string;
  id_rol: number;
  estado: number;
}

interface Rol {
  id_rol: number;
  nombre: string;
}

@Component({
  selector: 'app-a-usuarios',
  imports: [Footer, Navbar, NavbarA, CommonModule, FormsModule],
  templateUrl: './a-usuarios.html',
  styleUrl: './a-usuarios.css',
})
export class AUsuarios implements OnInit {

  private readonly BASE = 'https://inntech-backend.onrender.com';

  // ========================
  // Datos
  // ========================
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  loading = true;
  error: string | null = null;

  // ========================
  // Form nuevo usuario
  // ========================
  nuevoUsuario = {
    id_rol: 3,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    username: '',
    password: '',
    estado: 1,
  };

  isSubmitting = false;
  activeView: 'history' | 'create' = 'history';

  // pendingUpdates — equivale al Map de Svelte para deshabilitar controles por usuario
  pendingUpdates = new Set<number>();

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
    this.cargarRoles();
    this.cargarUsuarios();
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
  // Cargar roles — equivale a cargarRoles()
  // ========================
  async cargarRoles(): Promise<void> {
    try {
      const res = await fetch(`${this.BASE}/roles/combo`);
      if (!res.ok) throw new Error('Fallo al obtener roles');
      const data = await res.json();
      this.roles = data.data || [];
    } catch (err) {
      console.error('Error cargando roles:', err);
      this.showFloatingMessage('error', 'No se pudieron cargar los roles del sistema.');
    }
  }

  // ========================
  // Cargar usuarios — equivale a cargarUsuarios()
  // ========================
  async cargarUsuarios(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const res = await fetch(`${this.BASE}/usuarios/get_usuarios`);
      if (!res.ok) throw new Error('Fallo al obtener usuarios');
      const data = await res.json();

      // Ordenar por id_usuario descendente (más reciente primero) — igual que Svelte
      this.usuarios = data.data
        ? data.data.sort((a: Usuario, b: Usuario) => b.id_usuario - a.id_usuario)
        : [];
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      this.error = 'No se pudieron cargar los usuarios.';
      this.showFloatingMessage('error', 'Fallo al cargar la lista de usuarios.');
    } finally {
      this.loading = false;
    }
  }

  // ========================
  // Toggle estado — equivale a toggleEstado()
  // ========================
  async toggleEstado(usuario: Usuario): Promise<void> {
    if (this.showMessage) await this.hideMessageWithTransition(100);
    this.pendingUpdates.add(usuario.id_usuario);

    try {
      const url = usuario.estado === 1
        ? `${this.BASE}/usuarios/desactivar/${usuario.id_usuario}`
        : `${this.BASE}/usuarios/activar/${usuario.id_usuario}`;

      const res = await fetch(url, { method: 'PUT' });
      if (!res.ok) throw new Error('Error al cambiar el estado');

      await this.cargarUsuarios();
      const action = usuario.estado === 1 ? 'desactivado' : 'activado';
      this.showFloatingMessage('success', `Usuario ${usuario.username} ha sido ${action} con éxito.`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      this.showFloatingMessage('error', 'Fallo al cambiar el estado del usuario.');
    } finally {
      this.pendingUpdates.delete(usuario.id_usuario);
    }
  }

  // ========================
  // Cambiar rol — equivale a cambiarRol()
  // Llamado desde (change) del select con el nuevo id_rol como número
  // ========================
  async cambiarRol(usuario: Usuario, nuevoRolId: number): Promise<void> {
    if (this.showMessage) await this.hideMessageWithTransition(100);
    if (usuario.id_rol === nuevoRolId || isNaN(nuevoRolId)) return;

    this.pendingUpdates.add(usuario.id_usuario);

    try {
      const res = await fetch(
        `${this.BASE}/usuarios/cambiar-rol/${usuario.id_usuario}/${nuevoRolId}`,
        { method: 'PUT' }
      );
      if (!res.ok) throw new Error('Error al cambiar el rol');

      await this.cargarUsuarios();
      this.showFloatingMessage('success', `Rol de ${usuario.username} actualizado correctamente.`);
    } catch (err) {
      console.error('Error al cambiar rol:', err);
      this.showFloatingMessage('error', 'Fallo al cambiar el rol del usuario.');
    } finally {
      this.pendingUpdates.delete(usuario.id_usuario);
    }
  }

  // ========================
  // Crear usuario — equivale a crearUsuario()
  // ========================
  async crearUsuario(): Promise<void> {
    if (
      !this.nuevoUsuario.primer_nombre ||
      !this.nuevoUsuario.primer_apellido ||
      !this.nuevoUsuario.correo ||
      !this.nuevoUsuario.username ||
      !this.nuevoUsuario.password
    ) {
      this.showFloatingMessage('error', 'Por favor, rellena los campos obligatorios (*).');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;
    if (this.showMessage) await this.hideMessageWithTransition(100);

    try {
      const res = await fetch(`${this.BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.nuevoUsuario),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error ${res.status} al registrar.`);
      }

      this.limpiarNuevo();
      await this.cargarUsuarios();
      this.activeView = 'history'; // Cambiar vista después de crear — igual que Svelte
      this.showFloatingMessage('success', 'Usuario creado y registrado con éxito.');
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      this.showFloatingMessage('error', err.message || 'Error desconocido al intentar crear el usuario.');
    } finally {
      this.isSubmitting = false;
    }
  }

  limpiarNuevo(): void {
    this.nuevoUsuario = {
      id_rol: 3,
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      telefono: '',
      correo: '',
      username: '',
      password: '',
      estado: 1,
    };
  }

  // Helper para saber si un usuario tiene operación pendiente
  isPending(id: number): boolean {
    return this.pendingUpdates.has(id);
  }

  // Helper nombre completo para la tabla
  getNombreCompleto(u: Usuario): string {
    return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido]
      .filter(Boolean).join(' ');
  }

  getUsuariosActivos(): number {
    return this.usuarios.filter(u => u.estado === 1).length;
  }
}