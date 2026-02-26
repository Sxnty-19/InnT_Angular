import { TestBed } from '@angular/core/testing';

import { UsuarioHabitacion } from './usuario-habitacion';

describe('UsuarioHabitacion', () => {
  let service: UsuarioHabitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioHabitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
