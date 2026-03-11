import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],  // ← esto es todo lo que falta
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.css',
})
export class NoEncontrado {}