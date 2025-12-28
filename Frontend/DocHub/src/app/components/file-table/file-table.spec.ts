import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTable } from './file-table';

describe('FileTable', () => {
  let component: FileTable;
  let fixture: ComponentFixture<FileTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
