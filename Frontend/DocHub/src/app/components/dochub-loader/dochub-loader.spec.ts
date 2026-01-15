import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DochubLoader } from './dochub-loader';

describe('DochubLoader', () => {
  let component: DochubLoader;
  let fixture: ComponentFixture<DochubLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DochubLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DochubLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
