import { CollectionService } from './../../services/collections.service';
import { FileSearchRequest, FileSearchService } from './../../services/file-search.service';
import { FileRow, SearchSuggestion } from '../../models/file.model';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileGalleryComponent } from "../../components/file-gallery/file-gallery";
import { ElaticSearchBar } from "../../components/elatic-search-bar/elatic-search-bar";
import { DropdownComponent } from "../../components/dropdown/dropdown";
import { finalize } from 'rxjs/operators';
import { DocHubLoaderComponent } from "../../components/dochub-loader/dochub-loader";
import { FileTableComponent } from "../../components/file-table/file-table";
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toastService';
import { BottomBar } from "../../components/bottom-bar/bottom-bar";

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [
    CommonModule,
    FileGalleryComponent,
    ElaticSearchBar,
    DropdownComponent,
    DocHubLoaderComponent,
    FileTableComponent,
    BottomBar
],
  templateUrl: './collection-details.html'
})
export class CollectionDetailsComponent implements OnInit {
  filters: FileSearchRequest = {};

  sortby = [
    { id: 1, name: 'Size' },
    { id: 2, name: 'Upload Date' },
    { id: 3, name: 'Name' }
  ];

  collectionId!: string;
  collection: any = null;

  Addfiles: FileRow[] = [];
  loading = false;
  hasMore = true;
selectedFileIds:string[] = []
clearSelectedFiles = false;
  page = 0;
  size = 20;
  cdr = inject(ChangeDetectorRef);
  CollectionService = inject(CollectionService);
  toast = inject(ToastService)
  /** 🔥 IMPORTANT SEPARATION */
  allFiles: FileRow[] = [];   // API response (source of truth)
  files: FileRow[] = [];      // UI list
isDefaultCollection = false;
defaultCollectionName: string | null = null;
  searchTerm = '';
  sortBy: number | null = null;
  cursorTime:string|null = null;
  cursorId:string|null = null;
  isLoading = false;
  FileSearchSuggestions: SearchSuggestion[] = [];

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private cdf: ChangeDetectorRef,
    private FileSearchService: FileSearchService,
    private fileService:FileService
  ) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {

    const id = params.get('id');
    const defaultName = params.get('name');

    if (defaultName) {
      // ✅ DEFAULT COLLECTION
      this.isDefaultCollection = true;
      this.defaultCollectionName = defaultName;
      this.loadDefaultCollection(defaultName);
    }
    else if (id) {
      // ✅ REAL COLLECTION
      this.isDefaultCollection = false;
      this.collectionId = id;
      this.loadCollectionData(id);
    }
  });
}

loadDefaultCollection(collectionName:string){
  this.isLoading = true;
  this.CollectionService.getDefaultCollections(this.defaultCollectionName)?.pipe(
    finalize(()=>{
      this.isLoading = false;
      this.cdr.detectChanges();
    })

  )?.subscribe({
    next:(res)=>{
                this.collection = res;

          // ✅ store API response separately
          this.allFiles = Array.isArray(res.files) ? res.files : [];

          // ✅ initialize UI list
          this.applyFilters();
    },

    error:(err)=>{
      this.toast.error(err?.message || "Error Fetching files");
    }
  })
}
   fetchAddFiles(reset = false) {
    console.log("fetched add files called");

    if (reset) {
    this.Addfiles = [];
    this.cursorTime = null;
    this.cursorId = null;
    this.hasMore = true;
    this.loading = false;

  }
    if (this.loading || !this.hasMore) return;

    this.loading = true;

    this.FileSearchService.searchFiles(this.filters,this.cursorTime,this.cursorId,20).subscribe({
      next: (res) => {
        this.Addfiles = [...this.Addfiles,...res.items];
        this.hasMore = res.has_more;
        this.cursorId = res.next_cursor_id;
        this.cursorTime = res.next_cursor_time;
        this.loading = false;
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSelectionChanges(e:string[]){
    this.selectedFileIds = e;
  }

  removeFiles(e:string[]){
    this.isLoading = true;
    this.collectionService.RemoveFilesInCollection(this.collectionId,e).subscribe({
      next:(res)=>{
        this.toast.success("Files Removed");
         this.files = this.files.filter(
          file => !e.includes(file.id)
        );
        this.isLoading = false;
        this.clearSelection();
      },
      error:(err:any)=>{
        this.toast.error(err?.message);
        this.isLoading = false;

      }
    })
  }

addFilesToCollection(e:FileRow[]){
    const fileIds:string[] = e.map((file)=>{
      return file.id;
    })
    this.isLoading = true;
     this.CollectionService.AddFilesInCollection(this.collectionId,fileIds).subscribe({
      next: (res) => {
        this.toast.success("Files added to collection");
        this.loadCollectionData(this.collectionId);

        this.cdr.detectChanges()
      },
      error: () => {
        this.toast.error("Files addition Failed");
        this.isLoading = false;
      }
    });

}
clearSelection() {
    this.clearSelectedFiles = true;
    this.selectedFileIds = [];

    setTimeout(() => {
      this.clearSelectedFiles = false;
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
          this.files = this.allFiles
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

  applySearchOnCollectionFiles(e:string){

  }

  /* ---------------- SORT ---------------- */

  onSortChange(sortId: number) {
    this.sortBy = sortId;
    this.applyFilters();
  }

  downloadSelectedFiles(fileIds: string[]) {
    const toastId = this.toast.loading("downlading ...")
  this.fileService.DownloadFiles(fileIds).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'documents.zip'; // must match backend filename
      a.click();
      this.toast.success("Files Downloaded");
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Download failed');
    }
  });
}


  OnFileDelete(e:string[]){

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

        result.sort((a, b) => a?.name.localeCompare(b?.name));
        break;
    }


    this.files = result;
    this.cdf.detectChanges();
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

    this.fetchAddFiles(true);
  }
}
