import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  formData = this.getEmptyForm();
  confirmPassword = '';

  inlineError = '';
  isLoading = false;

  passwordVisible = false;
  confirmPasswordVisible = false;

  message = '';
  isSuccess = false;
  showMessage = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private cd: ChangeDetectorRef
  ) { }

  private getEmptyForm() {
    return {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      telefono: '',
      correo: '',
      username: '',
      password: ''
    };
  }

  togglePassword(field: string) {
    field === 'password'
      ? this.passwordVisible = !this.passwordVisible
      : this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  registrar() {

    this.resetMessages();

    const validationError = this.validateForm();
    if (validationError) {
      this.inlineError = validationError;
      return;
    }

    this.isLoading = true;

    this.auth.register(this.formData)
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error)
      });
  }

  private validateForm(): string | null {

    if (
      !this.formData.primer_nombre ||
      !this.formData.primer_apellido ||
      !this.formData.segundo_apellido ||
      !this.formData.username ||
      !this.formData.password ||
      !this.confirmPassword
    ) {
      return 'Por favor complete los campos obligatorios';
    }

    if (this.formData.telefono && !/^[0-9]+$/.test(this.formData.telefono)) {
      return 'El teléfono solo puede contener números';
    }

    if (this.formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.correo)) {
      return 'Ingrese un correo electrónico válido';
    }

    if (this.formData.password.length < 6) {
      return 'La contraseña debe tener mínimo 6 caracteres';
    }

    if (this.formData.password !== this.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  private handleSuccess() {
    this.isSuccess = true;
    this.message = 'Usuario registrado correctamente';
    this.showMessage = true;

    this.formData = this.getEmptyForm();
    this.confirmPassword = '';
    this.isLoading = false;

    this.cd.detectChanges();
  }

  private handleError(error: any) {
    this.inlineError = error.error?.detail || 'Error al registrar usuario';
    this.isLoading = false;
    this.cd.detectChanges();
  }

  private resetMessages() {
    this.inlineError = '';
    this.message = '';
    this.showMessage = false;
  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}