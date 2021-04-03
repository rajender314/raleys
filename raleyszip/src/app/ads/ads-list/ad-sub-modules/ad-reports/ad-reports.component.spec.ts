import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdReportsComponent } from './ad-reports.component';

describe('AdReportsComponent', () => {
  let component: AdReportsComponent;
  let fixture: ComponentFixture<AdReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdReportsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
