import { TestBed } from '@angular/core/testing';

import { CloudboardService } from './cloudboard.service';

describe('CloudboardService', () => {
  let service: CloudboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
