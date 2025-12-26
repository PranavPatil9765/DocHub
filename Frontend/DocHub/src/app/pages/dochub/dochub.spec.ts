import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dochub } from './dochub';

describe('Dochub', () => {
  let component: Dochub;
  let fixture: ComponentFixture<Dochub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dochub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dochub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
