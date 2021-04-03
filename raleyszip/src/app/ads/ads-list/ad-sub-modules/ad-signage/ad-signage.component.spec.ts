import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdSignageComponent } from './ad-signage.component';

describe('AdSignageComponent', () => {
  let component: AdSignageComponent;
  let fixture: ComponentFixture<AdSignageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdSignageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdSignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
