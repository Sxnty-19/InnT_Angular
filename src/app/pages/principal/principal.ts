import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-principal',
  imports: [Navbar, Footer],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {

}
