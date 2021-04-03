import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAssestsComponent } from './image-assests.component';

describe('ImageAssestsComponent', () => {
  let component: ImageAssestsComponent;
  let fixture: ComponentFixture<ImageAssestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageAssestsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageAssestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
