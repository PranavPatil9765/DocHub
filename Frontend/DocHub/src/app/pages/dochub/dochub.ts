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
  collectionsToShow:CollectionModel[]=[];
  filters: FileSearchRequest = {};
  FileSearchSuggestions: SearchSuggestion[] = [];
  CollectionSuggestion: SearchSuggestion[]=[];
  AddtoCollectionFileId!:string
  constructor(
    private FileSearchService: FileSearchService,
    private cdr: ChangeDetectorRef,
    private collectionService: CollectionService,
    private toast: ToastService

  ) {}

  ngOnInit() {
    this.fetchNextPage(true);
    this.fetchCollections();
  }

  private page = 0;

  /* ---------- INFINITE SCROLL ---------- */
  fetchNextPage(reset = false) {
    if (this.loading || (!this.hasMore && !reset)) return;

    if (reset) {
      this.files = [];
      this.cursorTime = null;
      this.cursorId = null;
      this.hasMore = true;
    }

    this.loading = true;

    this.FileSearchService.searchFiles(
      {
        ...this.filters,
        sortBy: this.sortBy,
        sortDir: this.sortDir,
      },
      this.cursorTime,
      this.cursorId
    ).subscribe((res) => {
      this.files = [...this.files, ...res.items];
      this.hasMore = res.hasMore;
      this.cursorTime = res.cursorTime;
      this.cursorId = res.cursorId;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onApplyFilters(form: any) {
    this.filters = {
      minSize: form?.minSize ? form?.minSize : undefined,
      maxSize: form?.maxSize ? form?.maxSize : undefined,
      fileType: form?.fileType?.value ?? null,
    };

    this.fetchNextPage(true);
  }

  onClearFilters() {
    this.filters = {};
    this.fetchNextPage(true);
  }

  fetchFileSuggestions(query: string) {
    this.FileSearchService.getSuggestions(query)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        })
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

  deleteFile(file: FileRow) {
    console.log('Delete', file);
  }

  private fetchCollections() {
    this.loadingCollections = true;
    this.collectionService
      .getCollections()
      .pipe(
        finalize(() => {
          this.loadingCollections = false;
          this.cdr.detectChanges();
        })
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
        })
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
  onAddtoCollection(e: {collection:CollectionModel,fileId:string}) {
     if (e.collection.file_ids.includes(e.fileId)) {
    // ℹ️ INFO TOAST
    this.toast.info('File already exists in this collection');
    return;
  }
   const toastId = this.toast.loading('Adding file');
   const fileIds = e.collection.file_ids;
   fileIds.push(e.fileId);
     this.collectionService
      .AddFilesInCollection(e.collection.id,{fileIds:fileIds})
      .pipe(
        finalize(() => {

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.toast.success("File Added to Collection")
        },
        error: (err) => {
            this.toast.success("File Addition failed")
        },
      });
  }
  closeAddToCollectionOverlay() {
    this.showAddtoCollectionOverlay = false;
  }

 onCollectionSearchSuggestion(q: string) {
  const query = q?.trim().toLowerCase();

  this.CollectionSuggestion = this.collections
    .filter(col =>
      col.name?.toLowerCase().includes(query)
    )
    .slice(0, 4)
    .map(col => ({
      id: col.id,
      name: col.name,
      icon:col.icon
    }) as SearchSuggestion);
}
onCollectionsearch(q:string){
  const query = q?.trim().toLowerCase();

  this.collectionsToShow = this.collections
    .filter(col =>
      col.name?.toLowerCase().includes(query)
    )
}
}
