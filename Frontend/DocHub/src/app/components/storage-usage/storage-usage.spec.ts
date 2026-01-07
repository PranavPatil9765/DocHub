import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageUsage } from './storage-usage';

describe('StorageUsage', () => {
  let component: StorageUsage;
  let fixture: ComponentFixture<StorageUsage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageUsage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageUsage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
