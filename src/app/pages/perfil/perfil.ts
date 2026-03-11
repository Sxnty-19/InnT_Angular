import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';
import { Footer } from '../../components/footer/footer';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../services/usuario';
import { TipoDocumento } from '../../services/tipo-documento';
import { Documento } from '../../services/documento';

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
    private tipoDocumentoService: TipoDocumento,
    private documentoService: Documento,
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
      next: () => alert("Usuario actualizado correctamente"),
      error: (err) => console.error(err)
    });
  }

  cargarTiposDocumento() {
    this.tipoDocumentoService.getTiposDocumento().subscribe({
      next: (res: any) => {
        this.tiposDoc = res.data || [];
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar tipos de documento:', err)
    });
  }

  cargarDocumentos() {
    if (!this.usuarioActual) return;

    this.documentoService.getDocumentos().subscribe({
      next: (res: any) => {
        this.documentos = res.data.filter((d: any) =>
          d.id_usuario === this.usuarioActual[0]
        );
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar documentos:', err)
    });
  }

  crearDocumento() {
    if (!this.usuarioActual) return;

    const payload = {
      ...this.documentoForm.value,
      id_usuario: this.usuarioActual[0]
    };

    this.documentoService.crearDocumento(payload).subscribe({
      next: () => {
        alert("Documento creado");
        this.documentoForm.reset({ estado: 1 });
        this.cargarDocumentos();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al crear documento:', err)
    });
  }
}