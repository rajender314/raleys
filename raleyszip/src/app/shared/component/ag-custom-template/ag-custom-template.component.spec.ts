import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgCustomTemplateComponent } from './ag-custom-template.component';

describe('AgCustomTemplateComponent', () => {
  let component: AgCustomTemplateComponent;
  let fixture: ComponentFixture<AgCustomTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AgCustomTemplateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgCustomTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
