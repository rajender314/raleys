import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitModComponent } from './split-mod.component';

describe('SplitModComponent', () => {
  let component: SplitModComponent;
  let fixture: ComponentFixture<SplitModComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SplitModComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
