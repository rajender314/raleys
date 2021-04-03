import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdPagesComponent } from './ad-pages.component';

describe('AdPagesComponent', () => {
  let component: AdPagesComponent;
  let fixture: ComponentFixture<AdPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdPagesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
