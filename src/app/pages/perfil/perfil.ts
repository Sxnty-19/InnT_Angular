import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Footer } from '../../components/footer/footer';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../services/usuario';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, Navbar, NavbarA, Footer, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  perfilForm!: FormGroup;
  documentoForm!: FormGroup;

  usuarioActual: any;

  documentos: any[] = [];
  tiposDoc: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usuarioService: Usuario,
    private http: HttpClient,
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

    this.documentoForm = this.fb.group({
      id_tdocumento: ['', Validators.required],
      numero_documento: ['', Validators.required],
      lugar_expedicion: ['', Validators.required],
      estado: [1]
    });

    this.cargarDatosUsuario();
    this.cargarTiposDocumento();
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

      this.cargarDocumentos();

      this.cd.detectChanges();
    });

  }

  actualizarUsuario() {

    const data = this.perfilForm.value;

    this.usuarioService.updateUsuario(data).subscribe({

      next: () => {
        alert("Usuario actualizado correctamente");
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  // =========================
  // TIPOS DOCUMENTO
  // =========================

  cargarTiposDocumento() {

    this.http.get<any>('https://inntech-backend.onrender.com/tipos_documento/get_tipos_documento')
      .subscribe(res => {
        this.tiposDoc = res.data;
      });

  }

  // =========================
  // DOCUMENTOS USUARIO
  // =========================

  cargarDocumentos() {

    this.http.get<any>('https://inntech-backend.onrender.com/documentos/get_documentos_completo')
      .subscribe(res => {

        this.documentos = res.data.filter((d: any) =>
          d.id_usuario === this.usuarioActual[0]
        );

      });

  }

  // =========================
  // CREAR DOCUMENTO
  // =========================

  crearDocumento() {

    const payload = {
      ...this.documentoForm.value,
      id_usuario: this.usuarioActual[0]
    };

    this.http.post(
      'https://inntech-backend.onrender.com/documentos/create_documento',
      payload
    ).subscribe({

      next: () => {

        alert("Documento creado");

        this.documentoForm.reset({
          estado: 1
        });

        this.cargarDocumentos();
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

}