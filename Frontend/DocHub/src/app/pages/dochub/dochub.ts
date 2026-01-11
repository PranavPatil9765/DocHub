import { Component } from '@angular/core';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { AdvancedFilterComponent } from "../../components/advanced-filter/advanced-filter";
import { CardSection } from "../../components/card-section/card-section";
import { FileRow } from '../../models/file-row';
import { FileTableComponent } from '../../components/file-table/file-table';
import { FileGalleryComponent } from '../../components/file-gallery/file-gallery';
import { FileUploadComponent } from "../../components/file-upload/file-upload";

@Component({
  selector: 'app-dochub',
  templateUrl: './dochub.html',
  styleUrl: './dochub.css',
  imports: [ElaticSearchBar, DropdownComponent, AdvancedFilterComponent, FileGalleryComponent]
})
export class Dochub {
  sortby = [
  { id: 1, name: 'Size' },
  { id: 2, name: 'Upload Date' },
  { id: 3, name: 'Name' }
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
        description:"ewe",
        url:"assets/Resume.pdf",
tags: [
  "invoice",
  "receipt",
  "bill",
  "payment",
  "finance",
  "tax",
  "gst",
  "bank-statement",
  "salary-slip",
  "budget",

  "resume",
  "cv",
  "offer-letter",
  "appointment-letter",
  "experience-letter",
  "certificate",
  "marksheet",
  "transcript",
  "id-proof",
  "passport",

  "project",
  "proposal",
  "report",
  "presentation",
  "ppt",
  "research",
  "analysis",
  "documentation",
  "requirements",
  "design",

  "contract",
  "agreement",
  "nda",
  "legal",
  "policy",
  "compliance",
  "terms",
  "license",
  "authorization",
  "approval"
],
        size: 1024 * (i + 2),
        isFavourite :false,
        uploadedAt: new Date(
          Date.now() - (page * 12 + i) * 86400000
        )
      };
    });
  }



//   files: any[] = [];
// page = 1;
// pageSize = 9;
// loading = false;
// hasMore = true;

// loadFiles() {
//   if (this.loading || !this.hasMore) return;

//   this.loading = true;

//   // 🔹 Example API call
//   this.fileService.getFiles(this.page, this.pageSize).subscribe({
//     next: (res) => {
//       this.files.push(...res.data);
//       this.hasMore = res.data.length === this.pageSize;
//       this.page++;
//       this.loading = false;
//     },
//     error: () => {
//       this.loading = false;
//     },
//   });
// }


}
