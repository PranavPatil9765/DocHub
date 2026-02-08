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
  FileUpdateRequest
} from '../../models/file.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../spinner/spinner";
import { getFileType } from '../../../utilities/file-functions';

/* ===================== STAGE TYPES ===================== */

type UploadStage =
  | 'initiated'
  | 'queued'
  | 'uploaded'
  | 'failed'
  | 'tagging'
  | 'ready';

/* ===================== COMPONENT ===================== */

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './file-upload.html'
})
export class FileUploadComponent {

  /* ===================== INPUTS ===================== */

  @Input() isOpen = false;
  toast = inject(ToastService);

  /** create | edit */
  @Input() mode: 'create' | 'edit' = 'create';

  /** Used only in edit mode */
  @Input() editFiles: FileRow[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  /* ===================== STATE ===================== */

  uploads: FileRow[] = [];
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
  extension = "";
  /* ===================== LIFECYCLE ===================== */

 ngOnChanges() {
  if (this.mode === 'edit' && this.editFiles?.length) {
    this.uploads = this.editFiles.map(f => {

      const ext = f.name.includes('.')
        ? f.name.substring(f.name.lastIndexOf('.'))
        : '';

      return {
        ...f,
        name: f.name.replace(/\.[^/.]+$/, ''), // base name only
        originalExt: ext,                      // ✅ preserve extension
        isExisting: true
      };
    });

    this.activeIndex = 0;
    this.isOpen = true;
  }
}



  get active(): FileRow | null {
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
 MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

 addFiles(files: File[]) {
  files.forEach(file => {

    // ❌ BLOCK files > 20MB
    if (file.size > this.MAX_FILE_SIZE) {
      this.toast.error(
        `File "${file.name}" is larger than 20MB and cannot be processed`
      );
      return; // 🚫 discard this file
    }

    const item: FileRow = {
      id: crypto.randomUUID(),
      file,
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      tags: [],
      favourite:false,
      size:file.size,
      type:getFileType(file.name),
      preview_url: "",
      progress: 0,
      stage: 'initiated'
    };

    this.uploads.push(item);

    // 🔥 START UPLOAD IMMEDIATELY
    this.startUpload(item);
  });

  if (this.uploads.length > 0) {
    this.isOpen = true;
  }
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

  startUpload(item: FileRow) {
    if (!item.file) return;
 const originalName = item.file.name;
  const ext = originalName.includes('.')
    ? originalName.substring(originalName.lastIndexOf('.'))
    : '';

  // 🔥 rebuild full filename
  const fullName = item.name + ext;
  item.type = getFileType(fullName);
    console.log(fullName);
    this.fileService.uploadFile(item.file, {
      name: fullName
    }).subscribe({
      next: update => {
        item.progress = update.progress;

        if (update.completed) {
          item.id = update.response.fileId;
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
  const payload = this.uploads.map(u => {
    const finalName =
      u.originalExt && !u.name.endsWith(u.originalExt)
        ? u.name + u.originalExt
        : u.name;

    return {
      id: u.id,
      name: finalName,
      description: u.description,
      tags: u.tags
    };
  });
console.log("calling edit with,",payload)
  this.http.put(this.editApi, payload).subscribe({
    next: () => {
      // this.updated.emit();
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
    this.active.tags = this.active.tags.filter((t:string) => t !== tag);
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

  retryFile(file: FileRow) {

  // reset UI state
  file.stage = 'queued';
  file.progress = 25;
  file.isRetrying = true;
  this.fileService.retryFile(file.id).pipe(finalize(()=>{
    file.isRetrying = false;
    this.cdr.detectChanges()
  })).subscribe({
    next: () => {
      // restart SSE
      this.startSse(file);
      this.toast.success('Retry started');
    },
    error: () => {
      file.stage = 'failed';
      this.toast.error('Retry failed');
      this.cdr.detectChanges();
    }
  });
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

  const files: FileUpdateRequest[] = this.uploads.map(file => {

    let finalName = file.name;

    // ✅ Case 1: Newly uploaded file (create mode)
    if (file.file) {
      const originalName = file.file.name;
      const ext = originalName.includes('.')
        ? originalName.substring(originalName.lastIndexOf('.'))
        : '';

      if (ext && !file.name.endsWith(ext)) {
        finalName = file.name + ext;
      }
    }

    // ✅ Case 2: Existing file (edit mode)
    else if (file.originalExt) {
      if (!file.name.endsWith(file.originalExt)) {
        finalName = file.name + file.originalExt;
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
  console.log(files);

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
        // this.updated.emit();
      },
      error: err => {
        console.error('[UPDATE FILES] failed', err);
        this.toast.error('Failed to update files. Please try again.');
      }
    });
}



  /* ===================== SSE ===================== */

  startSse(file: FileRow) {
    const api = `${environment.apiBaseUrl}`;
    const url = `${api}/api/sse/${file.id}`;

    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('file-uploaded', (event: any) => {
      console.log("event.data",event.data);

      const thumbnailLink = event.data;
      console.log(thumbnailLink);

      file.stage = 'uploaded';
      file.preview_url = thumbnailLink;
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

    es.addEventListener('file-failed', (event: any) => {
    const data = JSON.parse(event.data || '{}');
    file.stage = 'failed';
    file.progress = 25;
    this.toast.error(data.error || 'File upload failed');
    this.cdr.detectChanges();
    es.close();
  });

    es.addEventListener('tags-failed', (event: any) => {
    const data = JSON.parse(event.data || '{}');
    file.stage = 'failed';
    file.progress = 50;
    this.toast.error(data.error || 'Tag generation failed');
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
