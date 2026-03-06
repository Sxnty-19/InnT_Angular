import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CInformaciont } from './c-informaciont';

describe('CInformaciont', () => {
  let component: CInformaciont;
  let fixture: ComponentFixture<CInformaciont>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CInformaciont]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CInformaciont);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
