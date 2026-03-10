import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  username = '';
  password = '';
  inlineError = '';

  isLoading = false;
  passwordVisible = false;

  message = '';
  isSuccess = false;
  showMessage = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private cd: ChangeDetectorRef
  ) { }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    this.resetMessages();

    if (!this.username || !this.password) {
      this.inlineError = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;

    const body = new URLSearchParams();
    body.set('username', this.username);
    body.set('password', this.password);

    this.auth.login(body.toString())
      .subscribe({
        next: (data: any) => this.handleSuccess(data),
        error: (err) => this.handleError(err)
      });
  }

  private handleSuccess(data: any) {
    this.isSuccess = true;
    this.message = `Bienvenido, ${data.user.nombre}`;
    this.showMessage = true;

    localStorage.setItem('nombre', data.user.nombre);
    localStorage.setItem('id_usuario', data.user.id_usuario);
    localStorage.setItem('rol', data.user.rol);
    localStorage.setItem('id_rol', data.user.id_rol);
    localStorage.setItem('token', data.access_token);

    this.isLoading = false;
    this.cd.detectChanges();

    setTimeout(() => this.router.navigate(['/principal']), 1500);
  }

  private handleError(err: any) {
    this.inlineError = err.error?.detail || 'Usuario o contraseña incorrectos';
    this.isLoading = false;
    this.cd.detectChanges();
  }

  private resetMessages() {
    this.inlineError = '';
    this.message = '';
    this.showMessage = false;
  }

  irRegistro() {
    this.router.navigate(['/register']);
  }

  volverInicio() {
    this.router.navigate(['/']);
  }

  recuperarPassword() {
    this.message = 'Función en desarrollo';
    this.isSuccess = false;
    this.showMessage = true;
  }
}