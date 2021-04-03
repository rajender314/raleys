import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdSubModulesComponent } from './ad-sub-modules.component';

describe('AdSubModulesComponent', () => {
  let component: AdSubModulesComponent;
  let fixture: ComponentFixture<AdSubModulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdSubModulesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdSubModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
