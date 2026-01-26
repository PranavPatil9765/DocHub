import { FILE_TYPE_ICON, FileRow } from './../../models/file.model';
import { UploadProgress } from './../../services/file.service';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs';

import { FileSearchService, FileSearchRequest } from '../../services/file-search.service';
import { FileService } from '../../services/file.service';
import { ToastService } from '../../services/toastService';
import { SearchSuggestion } from '../../models/file.model';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { sortOptions } from '../../constants/constants';
import { mapStatusToStage } from '../../../utilities/file-functions';

@Component({
  selector: 'app-file-uploads',
  templateUrl: './file-uploads.html',
  imports: [CommonModule, FormsModule, ElaticSearchBar, DropdownComponent],
})
export class FileUploadsPage implements OnDestroy {
  uploads: FileRow[] = [];
  loading = false;
  hasMore = true;
  FILE_TYPE_ICON = FILE_TYPE_ICON;
  cursorTime: string | null = null;
  cursorId: string | null = null;
  FileSearchSuggestions: SearchSuggestion[] = [];

  search = '';
  filters: FileSearchRequest = {};

  private sseMap = new Map<string, EventSource>();

  sortBy: 'NAME' | 'SIZE' | 'UPLOADED_AT' = 'UPLOADED_AT';
  sortDir: 'ASC' | 'DESC' = 'DESC';
  sortOptions = sortOptions;
  constructor(
    private fileSearchService: FileSearchService,
    private fileService: FileService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  /* ---------------- INIT ---------------- */

  ngOnInit() {
    this.fetchNextPage(true);
  }

  ngOnDestroy() {
    this.sseMap.forEach((es) => es.close());
    this.sseMap.clear();
  }

  /* ---------------- PAGINATION ---------------- */

  fetchNextPage(reset = false) {
    if (reset) {
      this.uploads = [];
      this.cursorTime = null;
      this.cursorId = null;
      this.hasMore = true;
    }

    if (this.loading || !this.hasMore) return;

    this.loading = true;

    this.fileSearchService
      .searchFiles(
        {
          ...this.filters,
          query: this.search || undefined,
          sortBy: this.sortBy,
          sortDir: this.sortDir,
        },
        this.cursorTime,
        this.cursorId,
      )
      .subscribe({
        next: (res) => {
          const mapped: FileRow[] = res.items.map((f) => {
            const previewUrl = f.preview_url ? `${environment.apiBaseUrl}${f.preview_url}` : "";

            return {
              id: f.id,
              name: f.name,
              description: f.description ?? '',
              tags: f.tags ?? [],
              type: f.type,
              favourite:f.favourite,
              // 🔥 correct key
              preview_url:previewUrl,
              progress: f.uploadProgress ?? 0,
              stage: mapStatusToStage(f.status),
              isRetrying: false,

              size: f.file_size,
              uploadedAt: f.uploaded_at,
            };
          });

          this.uploads.push(...mapped);

          mapped.forEach((item) => this.startSse(item));

          this.hasMore = res.has_more;
          this.cursorTime = res.next_cursor_time;
          this.cursorId = res.next_cursor_id;

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onSortChange(sort: { sortBy: 'NAME' | 'SIZE' | 'UPLOADED_AT'; sortDir: 'ASC' | 'DESC' }) {
    this.sortBy = sort.sortBy;
    this.sortDir = sort.sortDir;

    // 🔥 FULL RESET
    this.uploads = [];
    this.cursorTime = null;
    this.cursorId = null;
    this.hasMore = true;

    // 🔥 Reload from start
    this.fetchNextPage(true);
  }

  onScrollBottom() {
    if (this.hasMore && !this.loading) {
      this.fetchNextPage();
    }
  }

  fetchFileSuggestions(query: string) {
    this.fileSearchService
      .getSuggestions(query)
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

  /* ---------------- SEARCH ---------------- */

  onSearch(q: string) {
    this.search = q;
    this.fetchNextPage(true);
  }

  /* ---------------- SSE (SAME AS UPLOAD MODAL) ---------------- */

  startSse(file: FileRow) {
    if (this.sseMap.has(file.id)) return;

    const es = new EventSource(`${environment.apiBaseUrl}/api/sse/${file.id}`, {
      withCredentials: true,
    });

    es.addEventListener('file-uploaded', () => {
      file.stage = 'uploaded';
      file.progress = 50;
      this.cdr.detectChanges();
    });

    es.addEventListener('tags-generated', (event: any) => {
      file.stage = 'ready';
      file.progress = 100;
      const newTags: string[] = JSON.parse(event.data || '[]');
      file.tags.push(...newTags);
      this.cleanupSse(file.id);
    });

    es.addEventListener('file-failed', (event: any) => {
      file.stage = 'failed';
      file.progress = 25;
      this.toast.error(JSON.parse(event.data || '{}').error || 'Upload failed');
      this.cleanupSse(file.id);
    });

    es.addEventListener('tags-failed', (event: any) => {
      file.stage = 'failed';
      file.progress = 50;
      this.toast.error(JSON.parse(event.data || '{}').error || 'Tagging failed');
      this.cleanupSse(file.id);
    });

    this.sseMap.set(file.id, es);
  }

  private cleanupSse(id: string) {
    const es = this.sseMap.get(id);
    if (es) es.close();
    this.sseMap.delete(id);
    this.cdr.detectChanges();
  }

  /* ---------------- ACTIONS ---------------- */

  retry(file: FileRow) {
    file.isRetrying = true;
    file.stage = 'queued';
    file.progress = 25;

    this.fileService
      .retryFile(file.id)
      .pipe(
        finalize(() => {
          file.isRetrying = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.toast.success('Retry started');
          this.startSse(file);
        },
        error: () => {
          file.stage = 'failed';
          this.toast.error('Retry failed');
        },
      });
  }

  delete(file: FileRow) {
    this.fileService.deleteFiles([file.id]).subscribe({
      next: () => {
        this.uploads = this.uploads.filter((f) => f.id !== file.id);
        this.toast.success('File deleted');
        this.cleanupSse(file.id);
      },
      error: () => this.toast.error('Delete failed'),
    });
  }
}
