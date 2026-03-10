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
      telefono: ['']
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
      });

      this.cd.detectChanges();
    });

  }

  actualizarUsuario() {

    const data = {
      primer_nombre: this.perfilForm.value.primer_nombre,
      segundo_nombre: this.perfilForm.value.segundo_nombre,
      primer_apellido: this.perfilForm.value.primer_apellido,
      segundo_apellido: this.perfilForm.value.segundo_apellido,
      telefono: this.perfilForm.value.telefono
    };

    this.usuarioService.updateUsuario(data).subscribe({

      next: () => {
        alert("Usuario actualizado correctamente");
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

}