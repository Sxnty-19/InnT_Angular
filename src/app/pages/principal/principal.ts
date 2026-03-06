import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { NavbarA } from "../../components/navbar-a/navbar-a";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-principal',
  imports: [Navbar, NavbarA, Footer],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {

}
