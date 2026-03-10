import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { NoEncontrado } from './pages/no-encontrado/no-encontrado';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Principal } from './pages/principal/principal';
import { Perfil } from './pages/perfil/perfil';
import { CInformaciont } from './pages/c-informaciont/c-informaciont';
import { CReservar } from './pages/c-reservar/c-reservar';
import { CReservasH } from './pages/c-reservas-h/c-reservas-h';
import { CSolicitar } from './pages/c-solicitar/c-solicitar';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'principal', component: Principal },
    { path: 'perfil', component: Perfil },
    { path: 'c-informaciont', component: CInformaciont },
    { path: 'c-reservar', component: CReservar },
    { path: 'c-reservas-h', component: CReservasH },
    { path: 'c-solicitar', component: CSolicitar },
    { path: '**', component: NoEncontrado }
];
