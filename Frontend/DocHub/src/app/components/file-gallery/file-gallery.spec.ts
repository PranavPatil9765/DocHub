import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileGallery } from './file-gallery';

describe('FileGallery', () => {
  let component: FileGallery;
  let fixture: ComponentFixture<FileGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileGallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
