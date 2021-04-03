import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSignageComponent } from './create-signage.component';

describe('CreateSignageComponent', () => {
  let component: CreateSignageComponent;
  let fixture: ComponentFixture<CreateSignageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSignageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
