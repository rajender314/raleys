import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteExpiredComponent } from './route-expired.component';

describe('RouteExpiredComponent', () => {
  let component: RouteExpiredComponent;
  let fixture: ComponentFixture<RouteExpiredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RouteExpiredComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
