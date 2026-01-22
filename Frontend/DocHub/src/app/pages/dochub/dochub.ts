import { FileSearchService } from './../../services/file-search.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { AdvancedFilterComponent } from '../../components/advanced-filter/advanced-filter';
import { CardSection } from '../../components/card-section/card-section';
import { FileRow, SearchSuggestion } from '../../models/file.model';
import { FileTableComponent } from '../../components/file-table/file-table';
import { FileGalleryComponent } from '../../components/file-gallery/file-gallery';
import { FileUploadComponent } from '../../components/file-upload/file-upload';
import { FileSearchRequest } from '../../services/file-search.service';
import { AddCollectionComponent } from '../../components/add-collection/add-collection';
import { CollectionService } from '../../services/collections.service';
import { finalize } from 'rxjs';
import { CollectionRequest } from '../../models/collectionRequest.model';
import { CollectionModel } from '../../models/collection';
import { ToastService } from '../../services/toastService';
import { BottomBar } from '../../components/bottom-bar/bottom-bar';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-dochub',
  templateUrl: './dochub.html',
  styleUrl: './dochub.css',
  imports: [
    ElaticSearchBar,
    DropdownComponent,
    AdvancedFilterComponent,
    FileGalleryComponent,
    AddCollectionComponent,
    BottomBar,
  ],
})
export class Dochub {
  sortOptions = [
    { label: 'Name (A → Z)', value: { sortBy: 'NAME', sortDir: 'ASC' } },
    { label: 'Name (Z → A)', value: { sortBy: 'NAME', sortDir: 'DESC' } },

    { label: 'Size (Small → Large)', value: { sortBy: 'SIZE', sortDir: 'ASC' } },
    { label: 'Size (Large → Small)', value: { sortBy: 'SIZE', sortDir: 'DESC' } },

    { label: 'Upload Date (Newest)', value: { sortBy: 'UPLOADED_AT', sortDir: 'DESC' } },
    { label: 'Upload Date (Oldest)', value: { sortBy: 'UPLOADED_AT', sortDir: 'ASC' } },
  ];
  // form = new FormGroup({
  //   category: new FormControl(null)
  // });
  files: FileRow[] = [];
  loading = false;
  hasMore = true;
  showAddtoCollectionOverlay = false;
  loadingCollections = false;
  cursorTime: string | null = null;
  cursorId: string | null = null;
  collections: CollectionModel[] = [];
  collectionsToShow: CollectionModel[] = [];
  selectedFileIds: string[] = [];
  clearSelectedFiles = false;
  filters: FileSearchRequest = {};
  FileSearchSuggestions: SearchSuggestion[] = [];
  CollectionSuggestion: SearchSuggestion[] = [];
  AddtoCollectionFileId!: string;
  constructor(
    private FileSearchService: FileSearchService,
    private cdr: ChangeDetectorRef,
    private collectionService: CollectionService,
    private toast: ToastService,
    private fileService: FileService,
  ) {}

  ngOnInit() {
    this.fetchNextPage(true);
    this.fetchCollections();
  }

  private page = 0;

  /* ---------- INFINITE SCROLL ---------- */
  fetchNextPage(reset = false) {
    /* ---------- RESET ---------- */
    if (reset) {
      this.files = [];
      this.cursorTime = null;
      this.cursorId = null;
      this.hasMore = true;
      this.loading = false;
    }

    /* ---------- GUARD ---------- */
    if (this.loading || !this.hasMore) {
      console.groupEnd();
      return;
    }

    this.loading = true;

    this.FileSearchService.searchFiles(
      {
        ...this.filters,
        sortBy: this.sortBy,
        sortDir: this.sortDir,
      },
      this.cursorTime,
      this.cursorId,
    ).subscribe({
      /* ---------- SUCCESS ---------- */
      next: (res) => {
        const beforeCount = this.files.length;
        this.files = [...this.files, ...res.items];

        this.hasMore = res?.has_more;
        this.cursorTime = res?.next_cursor_time;
        this.cursorId = res?.next_cursor_id;

        this.loading = false;

        this.cdr.detectChanges();
        console.groupEnd();
      },

      /* ---------- ERROR ---------- */
      error: (err) => {
        console.error('[SCROLL] REQUEST FAILED', err);
        this.loading = false;
        console.groupEnd();
      },
    });
  }

  OnFileDelete(e: string[]) {
    this.fileService.deleteFiles(e).subscribe({
      error: (err) => {
        this.toast.error(err?.message || 'File delete Failed');
        console.error('Failed to delete file', err);
      },
    });
  }
  onApplyFilters(form: any) {
    this.filters = {
      minSize: form?.minSize ? form?.minSize : undefined,
      fileType: form?.fileType?.value ?? null,
    };

    this.fetchNextPage(true);
  }

  onClearFilters() {
    this.filters = {};
    this.fetchNextPage(true);
  }
  clearSelection() {
    this.clearSelectedFiles = true;
    this.selectedFileIds = [];

    setTimeout(() => {
      this.clearSelectedFiles = false;
    });
  }
  downloadSelectedFiles(fileIds: string[]) {
    const toastId = this.toast.loading('downlading ...');
    this.fileService.DownloadFiles(fileIds).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'documents.zip'; // must match backend filename
        a.click();
        this.toast.success('Files Downloaded');
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Download failed');
      },
    });
  }
  fetchFileSuggestions(query: string) {
    this.FileSearchService.getSuggestions(query)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.FileSearchSuggestions = Array.isArray(res) ? res.slice(0, 4) : [];
        },
        error: (err) => {
          console.error('Suggestion fetch failed', err);
          this.FileSearchSuggestions = [];
        },
      });
  }

  onFileSearch(query: string) {
    this.filters = {
      ...this.filters,
      query,
    };

    this.fetchNextPage(true);
  }

  onScrollBottom() {
    if (this.hasMore && !this.loading) {
      this.fetchNextPage();
    }
  }

  sortBy: 'NAME' | 'SIZE' | 'UPLOADED_AT' = 'UPLOADED_AT';
  sortDir: 'ASC' | 'DESC' = 'DESC';

  onSortChange(sort: { sortBy: 'NAME' | 'SIZE' | 'UPLOADED_AT'; sortDir: 'ASC' | 'DESC' }) {
    this.sortBy = sort.sortBy;
    this.sortDir = sort.sortDir;

    // 🔥 FULL RESET
    this.files = [];
    this.cursorTime = null;
    this.cursorId = null;
    this.hasMore = true;

    // 🔥 Reload from start
    this.fetchNextPage(true);
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

  private fetchCollections() {
    this.loadingCollections = true;
    this.collectionService
      .getCollections()
      .pipe(
        finalize(() => {
          this.loadingCollections = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.loadingCollections = false;
          this.collections = Array.isArray(res?.data) ? res.data : [];
          this.collectionsToShow = this.collections;
        },
        error: (err) => {
          this.collections = [];
        },
      });
  }
  onSelectionChanges(e: string[]) {
    this.selectedFileIds = e;
  }
  onCreateCollection(event: CollectionRequest) {
    const newCollection: CollectionRequest = {
      name: event.name,
      icon: event.icon || '📁',
      description: event.description,
      fileIds: [],
    };
    this.collectionService
      .createCollection(newCollection)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.fetchCollections();
        },
        error: (err) => {},
      });
  }
  onShowAddCollectionOverlay(fileId: string) {
    this.AddtoCollectionFileId = fileId;
    this.showAddtoCollectionOverlay = true;
  }
  onAddtoCollection(e: { collection: CollectionModel; fileId: string }) {
    if (e.collection.file_ids.includes(e.fileId)) {
      // ℹ️ INFO TOAST
      this.toast.info('File already exists in this collection');
      return;
    }
    const toastId = this.toast.loading('Adding file');
    const fileIds = e.collection.file_ids;
    fileIds.push(e.fileId);
    this.collectionService
      .AddFilesInCollection(e.collection.id, fileIds)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.toast.success('File Added to Collection');
        },
        error: (err) => {
          this.toast.success('File Addition failed');
        },
      });
  }
  closeAddToCollectionOverlay() {
    this.showAddtoCollectionOverlay = false;
  }

  onCollectionSearchSuggestion(q: string) {
    const query = q?.trim().toLowerCase();

    this.CollectionSuggestion = this.collections
      .filter((col) => col.name?.toLowerCase().includes(query))
      .slice(0, 4)
      .map(
        (col) =>
          ({
            id: col.id,
            name: col.name,
            icon: col.icon,
          }) as SearchSuggestion,
      );
  }
  onCollectionsearch(q: string) {
    const query = q?.trim().toLowerCase();

    this.collectionsToShow = this.collections.filter((col) =>
      col.name?.toLowerCase().includes(query),
    );
  }
}
