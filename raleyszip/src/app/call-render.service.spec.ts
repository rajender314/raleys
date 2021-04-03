import { TestBed } from '@angular/core/testing';

import { CallRenderService } from './call-render.service';

describe('CallRenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallRenderService = TestBed.get(CallRenderService);
    expect(service).toBeTruthy();
  });
});
