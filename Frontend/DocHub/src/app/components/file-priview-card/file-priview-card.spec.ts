import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePriviewCard } from './file-priview-card';

describe('FilePriviewCard', () => {
  let component: FilePriviewCard;
  let fixture: ComponentFixture<FilePriviewCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePriviewCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilePriviewCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
