import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChunkUploaderComponent } from './chunk-uploader.component';

describe('ChunkUploaderComponent', () => {
  let component: ChunkUploaderComponent;
  let fixture: ComponentFixture<ChunkUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChunkUploaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChunkUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
