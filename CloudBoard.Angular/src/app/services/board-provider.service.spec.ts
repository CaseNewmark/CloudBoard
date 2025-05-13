import { TestBed } from '@angular/core/testing';

import { BoardProviderService } from './board-provider.service';

describe('BoardProviderService', () => {
  let service: BoardProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
