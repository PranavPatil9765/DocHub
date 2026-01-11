import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollection } from './add-collection';

describe('AddCollection', () => {
  let component: AddCollection;
  let fixture: ComponentFixture<AddCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
