import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromtionsViewComponent } from './promtions-view.component';

describe('PromtionsViewComponent', () => {
  let component: PromtionsViewComponent;
  let fixture: ComponentFixture<PromtionsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PromtionsViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromtionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
