import { TestBed } from '@angular/core/testing';

import { TipoHabitacion } from './tipo-habitacion';

describe('TipoHabitacion', () => {
  let service: TipoHabitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoHabitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
