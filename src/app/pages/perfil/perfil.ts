import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
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
  usuarioActual: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: Usuario,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.perfilForm = this.fb.group({
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      username: ['', Validators.required],
      correo: [''],
      telefono: [''],
      password: ['', Validators.minLength(6)]
    });

    this.cargarDatosUsuario();

  }

  cargarDatosUsuario() {

    this.usuarioService.getUsuarioToken().subscribe((res: any) => {

      const user = res.data;

      this.usuarioActual = user;

      this.perfilForm.patchValue({
        primer_nombre: user[2],
        segundo_nombre: user[3],
        primer_apellido: user[4],
        segundo_apellido: user[5],
        telefono: user[6],
        correo: user[7],
        username: user[8]
      });

    });

  }

  actualizarUsuario() {

    const data = {
      ...this.usuarioActual,
      ...this.perfilForm.value
    };

    if (!data.password) {
      data.password = this.usuarioActual[9];
    }

    this.usuarioService.updateUsuario(data).subscribe({

      next: () => {

        alert("Usuario actualizado correctamente: Algunos cambios pueden requerir que vuelvas a iniciar sesión.");

        // limpiar campo contraseña
        this.perfilForm.patchValue({
          password: ''
        });

      },

      error: (err) => {
        console.error(err);
      }

    });

  }

}