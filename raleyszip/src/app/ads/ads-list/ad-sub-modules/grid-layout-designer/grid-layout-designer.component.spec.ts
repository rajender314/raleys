import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLayoutDesignerComponent } from './grid-layout-designer.component';

describe('GridLayoutDesignerComponent', () => {
  let component: GridLayoutDesignerComponent;
  let fixture: ComponentFixture<GridLayoutDesignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GridLayoutDesignerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridLayoutDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
