import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from '../../components/navbar-a/navbar-a';

@Component({
  selector: 'app-c-solicitar',
  imports: [CommonModule, Footer, Navbar, NavbarA],
  templateUrl: './c-solicitar.html',
  styleUrl: './c-solicitar.css',
})
export class CSolicitar {

}
