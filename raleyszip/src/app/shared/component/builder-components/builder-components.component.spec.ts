import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderComponentsComponent } from './builder-components.component';

describe('BuilderComponentsComponent', () => {
  let component: BuilderComponentsComponent;
  let fixture: ComponentFixture<BuilderComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuilderComponentsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
