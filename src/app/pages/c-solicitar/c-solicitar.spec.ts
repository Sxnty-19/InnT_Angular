import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CSolicitar } from './c-solicitar';

describe('CSolicitar', () => {
  let component: CSolicitar;
  let fixture: ComponentFixture<CSolicitar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CSolicitar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CSolicitar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
