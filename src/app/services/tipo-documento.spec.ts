import { TestBed } from '@angular/core/testing';

import { TipoDocumento } from './tipo-documento';

describe('TipoDocumento', () => {
  let service: TipoDocumento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoDocumento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
