import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdDesignComponent } from './ad-design.component';

describe('AdDesignComponent', () => {
  let component: AdDesignComponent;
  let fixture: ComponentFixture<AdDesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdDesignComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
