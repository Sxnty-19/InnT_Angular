import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CReservas } from './c-reservas';

describe('CReservas', () => {
  let component: CReservas;
  let fixture: ComponentFixture<CReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CReservas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
