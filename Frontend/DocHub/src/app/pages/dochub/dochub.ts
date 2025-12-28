import { Component } from '@angular/core';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { AdvancedFilterComponent } from "../../components/advanced-filter/advanced-filter";
import { CardSection } from "../../components/card-section/card-section";
import { FileRow } from '../../models/file-row';
import { FileTableComponent } from '../../components/file-table/file-table';

@Component({
  selector: 'app-dochub',
  templateUrl: './dochub.html',
  styleUrl: './dochub.css',
  imports: [ElaticSearchBar, DropdownComponent, AdvancedFilterComponent, FileTableComponent]
})
export class Dochub {
  categories = [
  { id: 1, name: 'Documents' },
  { id: 2, name: 'Images' },
  { id: 3, name: 'Videos' }
];
// form = new FormGroup({
//   category: new FormControl(null)
// });




  files: FileRow[] = [];
  loading = false;
  hasMore = true;

  private page = 0;

  /* ---------- INITIAL LOAD ---------- */
  ngOnInit() {
    this.fetchNextPage();
  }

  /* ---------- INFINITE SCROLL ---------- */
  fetchNextPage() {
    if (this.loading) return;

    this.loading = true;

    setTimeout(() => {
      const newFiles: FileRow[] = this.generateDummyFiles(this.page);
      this.files = [...this.files, ...newFiles];

      this.page++;
      this.loading = false;

      // Stop after 3 pages
      if (this.page >= 3) {
        this.hasMore = false;
      }
    }, 800); // simulate API delay
  }

  /* ---------- ACTION HANDLERS ---------- */
  onSelection(files: FileRow[]) {
    console.log('Selected files:', files);
  }

  openFile(file: FileRow) {
    console.log('Open', file);
  }

  downloadFile(file: FileRow) {
    console.log('Download', file);
  }

  editFile(file: FileRow) {
    console.log('Edit', file);
  }

  deleteFile(file: FileRow) {
    console.log('Delete', file);
  }

  /* ---------- DUMMY GENERATOR ---------- */
  private generateDummyFiles(page: number): FileRow[] {
    const types = ['pdf', 'doc', 'xls', 'ppt', 'image'] as const;

    return Array.from({ length: 12 }).map((_, i) => {
      const type = types[(page * 3 + i) % types.length];

      return {
        id: `file-${page}-${i}`,
        name: `Project_File_${page}_${i}.${type}`,
        type,
        size: 1024 * (i + 2),
        uploadedAt: new Date(
          Date.now() - (page * 12 + i) * 86400000
        )
      };
    });
  }

}
