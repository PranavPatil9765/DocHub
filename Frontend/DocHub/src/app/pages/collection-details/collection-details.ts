import { FileRow } from '../../models/file.model';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../services/collections.service';
import { FileGalleryComponent } from "../../components/file-gallery/file-gallery";
import { ElaticSearchBar } from "../../components/elatic-search-bar/elatic-search-bar";
import { DropdownComponent } from "../../components/dropdown/dropdown";
import { finalize } from 'rxjs/operators';
import { DocHubLoaderComponent } from "../../components/dochub-loader/dochub-loader";

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [
    CommonModule,
    FileGalleryComponent,
    ElaticSearchBar,
    DropdownComponent,
    DocHubLoaderComponent
],
  templateUrl: './collection-details.html'
})
export class CollectionDetailsComponent implements OnInit {

  sortby = [
    { id: 1, name: 'Size' },
    { id: 2, name: 'Upload Date' },
    { id: 3, name: 'Name' }
  ];

  collectionId!: string;
  collection: any = null;

  /** 🔥 IMPORTANT SEPARATION */
  allFiles: FileRow[] = [];   // API response (source of truth)
  files: FileRow[] = [];      // UI list

  searchTerm = '';
  sortBy: number | null = null;

  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.collectionId = params.get('id')!;
      this.loadCollectionData(this.collectionId);
    });
  }

  private loadCollectionData(id: string) {
    this.isLoading = true;

    this.collectionService.getCollectionFiles(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdf.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.collection = res;

          // ✅ store API response separately
          this.allFiles = Array.isArray(res.files) ? res.files : [];

          // ✅ initialize UI list
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to load files', err);
          this.allFiles = [];
          this.files = [];
          this.cdf.detectChanges();
        }
      });
  }

  /* ---------------- SEARCH ---------------- */

  onSearch(term: string) {
    this.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  /* ---------------- SORT ---------------- */

  onSortChange(sortId: number) {
    this.sortBy = sortId;
    this.applyFilters();
  }

  /* ---------------- CORE FILTER LOGIC ---------------- */

  private applyFilters() {
    let result = [...this.allFiles]; // ✅ ALWAYS start from API data

    /* -------- SEARCH -------- */

      result = result.filter(file =>
        file.name.toLowerCase().includes(this.searchTerm)
      );


    /* -------- SORT -------- */
    switch (this.sortBy) {
      case 1: // Size
        result.sort((a, b) => a.file_size - b.file_size);
        break;

      case 2: // Upload Date
        result.sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        );
        break;

      case 3: // Name
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.files = result;
    this.cdf.detectChanges();
  }
}
