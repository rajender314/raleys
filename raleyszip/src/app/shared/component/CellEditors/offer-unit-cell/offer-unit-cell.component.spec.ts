import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferUnitCellComponent } from './offer-unit-cell.component';

describe('OfferUnitCellComponent', () => {
  let component: OfferUnitCellComponent;
  let fixture: ComponentFixture<OfferUnitCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OfferUnitCellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferUnitCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
