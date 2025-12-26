import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElaticSearchBar } from './elatic-search-bar';

describe('ElaticSearchBar', () => {
  let component: ElaticSearchBar;
  let fixture: ComponentFixture<ElaticSearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElaticSearchBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElaticSearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
