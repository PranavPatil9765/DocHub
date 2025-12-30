import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessSection } from './quick-access-section';

describe('QuickAccessSection', () => {
  let component: QuickAccessSection;
  let fixture: ComponentFixture<QuickAccessSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAccessSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickAccessSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
