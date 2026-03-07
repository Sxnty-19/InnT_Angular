import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from "../../components/navbar-a/navbar-a";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-principal',
  imports: [CommonModule, Navbar, NavbarA, Footer],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {
  nombre_U: string | null = null;
  nombre_r: string | null = null;

  ngOnInit(): void {
    this.nombre_U = localStorage.getItem('nombre');
    this.nombre_r = localStorage.getItem('rol');
  }
}