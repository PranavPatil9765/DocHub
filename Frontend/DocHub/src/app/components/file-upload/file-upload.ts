import { FileService } from '../../services/file.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FILE_TYPE_COLOR,
  FILE_TYPE_ICON,
  FileRow,
  FileType,
  FileUpdateRequest,
  UploadItem
} from '../../models/file.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';

/* ===================== STAGE TYPES ===================== */

type UploadStage =
  | 'initiated'
  | 'queued'
  | 'uploaded'
  | 'tagging'
  | 'ready';

/* ===================== COMPONENT ===================== */

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html'
})
export class FileUploadComponent {

  /* ===================== INPUTS ===================== */

  @Input() isOpen = false;
  toast = inject(ToastService);

  /** create | edit */
  @Input() mode: 'create' | 'edit' = 'create';

  /** Used only in edit mode */
  @Input() editFiles: UploadItem[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  /* ===================== STATE ===================== */

  uploads: UploadItem[] = [];
  activeIndex = 0;
  isDragging = false;
  tagInput = '';

  FILE_TYPE_ICON = FILE_TYPE_ICON;
  FILE_TYPE_COLOR = FILE_TYPE_COLOR;

  private editApi = `/files/edit`;

  /* ===================== STAGE CONFIG (NEW) ===================== */

  readonly STAGES: {
    key: UploadStage;
    label: string;
    progress: number;
  }[] = [
    { key: 'initiated', label: 'Initiated', progress: 10 },
    { key: 'queued', label: 'Queued', progress: 25 },
    { key: 'uploaded', label: 'Uploaded', progress: 50 },
    { key: 'tagging', label: 'Tagging', progress: 75 },
    { key: 'ready', label: 'Ready', progress: 100 }
  ];

  constructor(
    private fileService: FileService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  /* ===================== LIFECYCLE ===================== */

  ngOnChanges() {
    if (this.mode === 'edit' && this.editFiles?.length) {
      this.uploads = this.editFiles.map(f => ({
        ...f,
        progress: 100,
        status: 'done',
        isExisting: true
      }));
      this.activeIndex = 0;
      this.isOpen = true;
    }
  }

  get active(): UploadItem | null {
    return this.uploads[this.activeIndex] ?? null;
  }

  /* ===================== STAGE HELPERS (NEW) ===================== */

  stageProgress(stage?: UploadStage): number {
    return this.STAGES.find(s => s.key === stage)?.progress ?? 0;
  }

  stagesWithStatus(stage?: UploadStage) {
    const currentIndex = this.STAGES.findIndex(s => s.key === stage);
    return this.STAGES.map((s, i) => ({
      ...s,
      done: i <= currentIndex
    }));
  }

  /* ===================== FILE ADD ===================== */

  onFilesSelected(event: Event) {
    if (this.mode === 'edit') return;

    const files = Array.from(
      (event.target as HTMLInputElement).files || []
    );

    this.addFiles(files);
  }

  addFiles(files: File[]) {
    files.forEach(file => {
      const item: UploadItem = {
        id: crypto.randomUUID(),
        file,
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        tags: [],
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        stage: 'initiated'
      };

      this.uploads.push(item);

      // 🔥 START UPLOAD IMMEDIATELY
      this.startUpload(item);
    });

    this.isOpen = true;
  }

  removeUpload(index: number) {
    const file = this.uploads[index];
    if (!file) return;

    if (this.mode === 'create') {
      this.fileService.deleteFiles([file.id]).subscribe({
        error: err => {
          console.error('Failed to delete file', err);
        }
      });
    }

    this.uploads.splice(index, 1);

    if (this.activeIndex >= this.uploads.length) {
      this.activeIndex = Math.max(0, this.uploads.length - 1);
    }
  }

  open() {
    this.isOpen = true;
  }

  /* ===================== UPLOAD ===================== */

  startUpload(item: UploadItem) {
    if (!item.file) return;
 const originalName = item.file.name;
  const ext = originalName.includes('.')
    ? originalName.substring(originalName.lastIndexOf('.'))
    : '';

  // 🔥 rebuild full filename
  const fullName = item.name + ext;
    console.log(fullName);

    this.fileService.uploadFile(item.file, {
      name: fullName
    }).subscribe({
      next: update => {
        item.progress = update.progress;

        if (update.completed) {
          item.id = update.response.fileId;
          item.previewUrl = update.response.thumbnailLink
          console.log("url = ",item.previewUrl);

          item.stage = 'queued';
          item.progress = 25;
          this.cdr.detectChanges();
          this.startSse(item);
        }
      },
      error: () => {
        item.stage = 'initiated';
        item.progress = 0;
      }
    });
  }

  canUploadAll(): boolean {
    return (
      this.uploads.length > 0 &&
      this.uploads.every(u => u.stage !== 'initiated')
    );
  }

  /* ===================== EDIT SAVE ===================== */

  saveEdits() {
    const payload = this.uploads.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      tags: u.tags
    }));

    this.http.put(this.editApi, payload).subscribe({
      next: () => {
        this.updated.emit();
        this.close();
      }
    });
  }

  /* ===================== TAGS ===================== */

  addTag() {
    if (!this.active) return;

    const value = this.tagInput.trim();
    if (!value || this.active.tags.includes(value)) return;

    this.active.tags.push(value);
    this.tagInput = '';
  }

  removeTag(tag: string) {
    if (!this.active) return;
    this.active.tags = this.active.tags.filter(t => t !== tag);
  }

  /* ===================== UTILS ===================== */

  detectFileType(name: string): FileType {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';

    if (['jpg','png','jpeg','webp'].includes(ext)) return FileType.IMAGE;
    if (['mp4','mkv','avi'].includes(ext)) return FileType.VIDEO;
    if (['mp3','wav'].includes(ext)) return FileType.AUDIO;
    if (['pdf','doc','docx','xls','xlsx'].includes(ext)) return FileType.DOCUMENT;
    if (['zip','rar','7z'].includes(ext)) return FileType.ARCHIVE;
    if (['js','ts','java','py','cpp'].includes(ext)) return FileType.CODE;

    return FileType.OTHER;
  }

  close() {
    this.isOpen = false;
    this.uploads = [];
    this.closed.emit();
  }

  deletefiles(){
      if (this.mode === 'create') {
      const idsToDelete = this.uploads.map(file => file.id);

      if (idsToDelete.length > 0) {
        this.fileService.deleteFiles(idsToDelete).subscribe({
          error: err => {
            console.error('Failed to delete files on close', err);
          }
        });
      }
    }
    this.close();
  }

 uploadAll() {
  if (this.uploads.length === 0) return;

  // ✅ Build payload with extension preserved
  const files: FileUpdateRequest[] = this.uploads.map(file => {

    let finalName = file.name;

    // 🔥 Re-attach extension if file exists
    if (file.file) {
      const originalName = file.file.name;
      const ext = originalName.includes('.')
        ? originalName.substring(originalName.lastIndexOf('.'))
        : '';

      // avoid double extension
      if (ext && !file.name.endsWith(ext)) {
        finalName = file.name + ext;
      }
    }

    return {
      id: file.id,
      name: finalName,
      description: file.description,
      tags: file.tags
    };
  });

  const toastId = this.toast.loading('Saving Files...');

  this.fileService.updateFiles(files)
    .pipe(
      finalize(() => {
        this.close();
        window.location.reload();
      })
    )
    .subscribe({
      next: () => {
        this.toast.success('Files updated successfully');
        this.updated.emit();
      },
      error: err => {
        console.error('[UPDATE FILES] failed', err);
        this.toast.error('Failed to update files. Please try again.');
      }
    });
}


  /* ===================== SSE ===================== */

  startSse(file: UploadItem) {
    const api = `${environment.apiBaseUrl}`;
    const url = `${api}/api/sse/${file.id}`;

    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('file-uploaded', () => {
      file.stage = 'uploaded';
      file.progress = 50;
      this.cdr.detectChanges();
    });

    es.addEventListener('tags-generated', (event: any) => {
      file.stage = 'ready';
      file.progress = 100;
      const newTags: string[] = JSON.parse(event.data);
      file.tags = [...file.tags, ...newTags];
      this.cdr.detectChanges();
      es.close();
    });
  }

  /* ===================== DRAG ===================== */

  @HostListener('window:dragover', ['$event'])
  onDragOver(e: DragEvent) {
    if (this.mode === 'edit') return;
    e.preventDefault();
    this.isDragging = true;
  }

  @HostListener('window:drop', ['$event'])
  onDrop(e: DragEvent) {
    if (this.mode === 'edit') return;
    e.preventDefault();
    this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }
}
