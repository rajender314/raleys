import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveViewComponent } from './save-view.component';

describe('SaveViewComponent', () => {
  let component: SaveViewComponent;
  let fixture: ComponentFixture<SaveViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaveViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
