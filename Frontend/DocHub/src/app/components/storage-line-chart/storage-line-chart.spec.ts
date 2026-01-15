import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLineChart } from './storage-line-chart';

describe('StorageLineChart', () => {
  let component: StorageLineChart;
  let fixture: ComponentFixture<StorageLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLineChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
