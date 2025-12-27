import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSection } from './card-section';

describe('CardSection', () => {
  let component: CardSection;
  let fixture: ComponentFixture<CardSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
