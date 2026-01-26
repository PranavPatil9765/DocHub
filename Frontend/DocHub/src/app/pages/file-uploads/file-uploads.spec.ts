import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploads } from './file-uploads';

describe('FileUploads', () => {
  let component: FileUploads;
  let fixture: ComponentFixture<FileUploads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploads);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
