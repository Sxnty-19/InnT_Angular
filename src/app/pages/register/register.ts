import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    username: '',
    password: ''
  };

  confirmPassword: string = '';

  inlineError: string = '';
  isLoading: boolean = false;

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  message: string = '';
  isSuccess: boolean = false;
  showMessage: boolean = false;

  constructor(private router: Router) { }

  togglePassword(field: string) {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  async registrar() {

  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}
/*
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  formData = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    username: '',
    password: ''
  };

  confirmPassword: string = '';

  inlineError: string = '';
  isLoading: boolean = false;

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  message: string = '';
  isSuccess: boolean = false;
  showMessage: boolean = false;

  constructor(private router: Router) {}

  togglePassword(field: string) {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  async registrar() {

    this.inlineError = '';
    this.showMessage = false;

    // Validación contraseñas
    if (this.formData.password !== this.confirmPassword) {
      this.inlineError = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    try {

      const response = await fetch(
        'https://inntech-backend.onrender.com/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_rol: 3,
            estado: 1,
            ...this.formData
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        this.message = result.detail || 'Error al registrar';
        this.isSuccess = false;
        this.showMessage = true;
        return;
      }

      this.message = 'Usuario registrado correctamente';
      this.isSuccess = true;
      this.showMessage = true;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error) {
      this.inlineError = 'Error de conexión';
    } finally {
      this.isLoading = false;
    }
  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}
*/