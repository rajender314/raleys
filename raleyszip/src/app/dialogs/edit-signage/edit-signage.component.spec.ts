import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSignageComponent } from './edit-signage.component';

describe('EditSignageComponent', () => {
  let component: EditSignageComponent;
  let fixture: ComponentFixture<EditSignageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSignageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
