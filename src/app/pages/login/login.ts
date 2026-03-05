import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  inlineError: string = '';

  isLoading: boolean = false;
  passwordVisible: boolean = false;

  message: string = '';
  isSuccess: boolean = false;
  showMessage: boolean = false;

  constructor(private router: Router) { }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async login() {

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