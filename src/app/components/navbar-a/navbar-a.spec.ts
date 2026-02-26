import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarA } from './navbar-a';

describe('NavbarA', () => {
  let component: NavbarA;
  let fixture: ComponentFixture<NavbarA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarA);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
