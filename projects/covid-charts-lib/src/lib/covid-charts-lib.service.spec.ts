import { TestBed } from '@angular/core/testing';

import { CovidChartsLibService } from './covid-charts-lib.service';

describe('CovidChartsLibService', () => {
  let service: CovidChartsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CovidChartsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
