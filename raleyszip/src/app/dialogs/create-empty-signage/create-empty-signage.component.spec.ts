import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmptySignageComponent } from './create-empty-signage.component';

describe('CreateEmptySignageComponent', () => {
  let component: CreateEmptySignageComponent;
  let fixture: ComponentFixture<CreateEmptySignageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEmptySignageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEmptySignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
