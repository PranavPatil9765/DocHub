import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCard } from './collection-card';

describe('CollectionCard', () => {
  let component: CollectionCard;
  let fixture: ComponentFixture<CollectionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
