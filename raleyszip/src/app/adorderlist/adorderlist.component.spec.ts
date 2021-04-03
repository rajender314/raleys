import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdorderlistComponent } from './adorderlist.component';

describe('AdorderlistComponent', () => {
  let component: AdorderlistComponent;
  let fixture: ComponentFixture<AdorderlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdorderlistComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdorderlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
