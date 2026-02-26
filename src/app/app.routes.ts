import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { NoEncontrado } from './pages/no-encontrado/no-encontrado';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Principal } from './pages/principal/principal';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'principal', component: Principal },
    { path: '**', component: NoEncontrado }
];
