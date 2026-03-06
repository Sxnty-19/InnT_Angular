import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CReservasH } from './c-reservas-h';

describe('CReservasH', () => {
  let component: CReservasH;
  let fixture: ComponentFixture<CReservasH>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CReservasH]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CReservasH);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
