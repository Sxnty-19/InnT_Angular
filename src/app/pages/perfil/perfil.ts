import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Footer } from '../../components/footer/footer';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../services/usuario';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, Navbar, NavbarA, Footer, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  perfilForm!: FormGroup;
  passwordActual = "";

  constructor(
    private fb: FormBuilder,
    private Usuario: Usuario
  ) { }

  ngOnInit(): void {

    this.perfilForm = this.fb.group({
      primer_nombre: ['', Validators.required],
      primer_apellido: ['', Validators.required],
      username: ['', Validators.required],
      correo: [''],
      telefono: [''],
      password: ['', Validators.minLength(6)]
    });

    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {

    this.Usuario.getUsuarioToken().subscribe((res: any) => {

      const user = res.data;

      this.perfilForm.patchValue({
        primer_nombre: user.primer_nombre,
        primer_apellido: user.primer_apellido,
        username: user.username,
        correo: user.correo,
        telefono: user.telefono
      });

      this.passwordActual = user.password;

    });

  }

  actualizarUsuario() {

    let data = this.perfilForm.value;

    if (!data.password) {
      data.password = this.passwordActual;
    }

    this.Usuario.updateUsuario(data).subscribe({

      next: (res) => {
        alert("Usuario actualizado correctamente")
      },

      error: (err) => {
        console.error(err)
      }

    });

  }
}