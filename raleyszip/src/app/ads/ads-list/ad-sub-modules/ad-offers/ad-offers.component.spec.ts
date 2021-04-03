import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdOffersComponent } from './ad-offers.component';

describe('AdOffersComponent', () => {
  let component: AdOffersComponent;
  let fixture: ComponentFixture<AdOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdOffersComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
