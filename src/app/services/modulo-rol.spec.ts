import { TestBed } from '@angular/core/testing';

import { ModuloRol } from './modulo-rol';

describe('ModuloRol', () => {
  let service: ModuloRol;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuloRol);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
