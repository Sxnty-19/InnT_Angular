import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CReservar } from './c-reservar';

describe('CReservar', () => {
  let component: CReservar;
  let fixture: ComponentFixture<CReservar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CReservar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CReservar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
