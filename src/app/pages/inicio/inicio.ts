import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterModule, Footer],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  habitaciones = [
    {
      nombre: "Habitación Sencilla",
      descripcion: "Diseñada para el viajero solitario, ofrece comodidad y privacidad con una cama individual grande.",
      imagen: "habitaciones/sencilla.png"
    },
    {
      nombre: "Habitación Doble",
      descripcion: "Perfecta para parejas o dos amigos. Disponible con cama doble o dos individuales.",
      imagen: "habitaciones/doble.png"
    },
    {
      nombre: "Habitación Múltiple",
      descripcion: "Ideal para grupos pequeños o familias. Tres o cuatro camas cómodas.",
      imagen: "habitaciones/multiple.png"
    },
    {
      nombre: "Habitación Quíntuple",
      descripcion: "Espacio amplio con cinco camas para grandes grupos.",
      imagen: "habitaciones/quintuple.png"
    },
    {
      nombre: "Habitación Séxtuple",
      descripcion: "Nuestra opción más espaciosa, con seis camas.",
      imagen: "habitaciones/sextuple.png"
    }
  ];
}
