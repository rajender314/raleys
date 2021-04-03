import { TestBed } from '@angular/core/testing';

import { CompService } from './comp.service';

describe('CompService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompService = TestBed.get(CompService);
    expect(service).toBeTruthy();
  });
});
