import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagCloud } from './tag-cloud';

describe('TagCloud', () => {
  let component: TagCloud;
  let fixture: ComponentFixture<TagCloud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagCloud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagCloud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
