import { TestBed } from '@angular/core/testing';

import { Modulo } from './modulo';

describe('Modulo', () => {
  let service: Modulo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Modulo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
