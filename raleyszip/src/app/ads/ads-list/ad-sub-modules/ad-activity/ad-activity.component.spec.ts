import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdActivityComponent } from './ad-activity.component';

describe('AdActivityComponent', () => {
  let component: AdActivityComponent;
  let fixture: ComponentFixture<AdActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdActivityComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
