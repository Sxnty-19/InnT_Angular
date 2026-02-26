import { TestBed } from '@angular/core/testing';

import { ReservaHabitacion } from './reserva-habitacion';

describe('ReservaHabitacion', () => {
  let service: ReservaHabitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservaHabitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
