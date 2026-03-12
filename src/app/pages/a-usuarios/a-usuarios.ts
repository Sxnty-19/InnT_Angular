import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Rol as RolService } from '../../services/rol';
import { Auth } from '../../services/auth';
import { Usuario as UsuarioService } from '../../services/usuario';

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

  constructor(private cd: ChangeDetectorRef, private rolService: RolService, private authService: Auth, private usuarioService: UsuarioService) { }

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
    this.cd.detectChanges(); // Asegura que la vista se actualice después de cargar datos
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
        this.cd.detectChanges(); // Asegura que la vista se actualice después de ocultar el mensaje
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

    this.cd.detectChanges();
    this.toastTimeout = setTimeout(() => {
      this.hideMessageWithTransition(300);
    }, 4000);
  }

  // ========================
  // Cargar roles — equivale a cargarRoles()
  // ========================
  cargarRoles(): void {

    this.rolService.getRoles().subscribe({

      next: (data) => {

        this.roles = data.data || [];

        this.cd.detectChanges();
      },

      error: (err) => {

        console.error('Error cargando roles:', err);

        this.showFloatingMessage(
          'error',
          'No se pudieron cargar los roles del sistema.'
        );

        this.cd.detectChanges();
      }

    });

  }

  // ========================
  // Cargar usuarios — equivale a cargarUsuarios()
  // ========================
  cargarUsuarios(): void {

    this.loading = true;
    this.error = null;

    this.usuarioService.getUsuarios().subscribe({

      next: (data) => {

        this.usuarios = data.data
          ? data.data.sort((a: Usuario, b: Usuario) => b.id_usuario - a.id_usuario)
          : [];

        this.loading = false;
        this.cd.detectChanges();

      },

      error: (err) => {

        console.error('Error cargando usuarios:', err);

        this.error = 'No se pudieron cargar los usuarios.';

        this.showFloatingMessage(
          'error',
          'Fallo al cargar la lista de usuarios.'
        );

        this.loading = false;
        this.cd.detectChanges();

      }

    });

  }

  // ========================
  // Toggle estado — equivale a toggleEstado()
  // ========================
  async toggleEstado(usuario: Usuario): Promise<void> {

    if (this.showMessage) await this.hideMessageWithTransition(100);

    this.pendingUpdates.add(usuario.id_usuario);
    this.cd.detectChanges();

    const request =
      usuario.estado === 1
        ? this.usuarioService.desactivarUsuario(usuario.id_usuario)
        : this.usuarioService.activarUsuario(usuario.id_usuario);

    request.subscribe({

      next: async () => {

        await this.cargarUsuarios();

        const action = usuario.estado === 1 ? 'desactivado' : 'activado';

        this.showFloatingMessage(
          'success',
          `Usuario ${usuario.username} ha sido ${action} con éxito.`
        );

      },

      error: (err) => {

        console.error('Error al cambiar estado:', err);

        this.showFloatingMessage(
          'error',
          'Fallo al cambiar el estado del usuario.'
        );

      },

      complete: () => {

        this.pendingUpdates.delete(usuario.id_usuario);
        this.cd.detectChanges();

      }

    });

  }

  // ========================
  // Cambiar rol — equivale a cambiarRol()
  // Llamado desde (change) del select con el nuevo id_rol como número
  // ========================
  async cambiarRol(usuario: Usuario, nuevoRolId: number): Promise<void> {

    if (this.showMessage) await this.hideMessageWithTransition(100);

    if (usuario.id_rol === nuevoRolId || isNaN(nuevoRolId)) return;

    this.pendingUpdates.add(usuario.id_usuario);
    this.cd.detectChanges();

    this.usuarioService
      .cambiarRol(usuario.id_usuario, nuevoRolId)
      .subscribe({

        next: async () => {

          await this.cargarUsuarios();

          this.showFloatingMessage(
            'success',
            `Rol de ${usuario.username} actualizado correctamente.`
          );

        },

        error: (err) => {

          console.error('Error al cambiar rol:', err);

          this.showFloatingMessage(
            'error',
            'Fallo al cambiar el rol del usuario.'
          );

        },

        complete: () => {

          this.pendingUpdates.delete(usuario.id_usuario);
          this.cd.detectChanges();

        }

      });

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
      this.showFloatingMessage(
        'error',
        'Por favor, rellena los campos obligatorios (*).'
      );
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.cd.detectChanges();

    if (this.showMessage) await this.hideMessageWithTransition(100);

    this.authService.register(this.nuevoUsuario).subscribe({

      next: async () => {

        this.limpiarNuevo();

        await this.cargarUsuarios();

        this.activeView = 'history';

        this.showFloatingMessage(
          'success',
          'Usuario creado y registrado con éxito.'
        );

      },

      error: (err) => {

        console.error('Error al crear usuario:', err);

        const message =
          err?.error?.detail ||
          'Error desconocido al intentar crear el usuario.';

        this.showFloatingMessage('error', message);

      },

      complete: () => {

        this.isSubmitting = false;
        this.cd.detectChanges();

      }

    });

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