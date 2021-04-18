import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CovidChartsLibComponent } from './covid-charts-lib.component';

describe('CovidChartsLibComponent', () => {
  let component: CovidChartsLibComponent;
  let fixture: ComponentFixture<CovidChartsLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidChartsLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CovidChartsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
