import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FILE_TYPE_COLOR, FILE_TYPE_ICON, FileRow, FileType } from '../../models/file.model';
import { DefaultFile } from '../../constants/constants';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrls:['./file-upload.scss']
})
export class FileUploadComponent implements OnChanges {

  constructor(private sanitizer: DomSanitizer) {}

  /* =====================
   * INPUTS
   * ===================== */

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() editData:FileRow|null = DefaultFile

  /* =====================
   * STATE
   * ===================== */
  isTagsLoading = false;


  @Input() isOpen = false;
  @Output() closeEdit = new EventEmitter<void>();
  step: 1 | 2 = 1;
  isDragging = false;


FILE_TYPE_ICON = FILE_TYPE_ICON;
FILE_TYPE_COLOR = FILE_TYPE_COLOR;

fileType!: FileType;

get fileTypeLabel(): string {
  return this.fileType.charAt(0) + this.fileType.slice(1).toLowerCase();
}

  ngOnChanges(changes: SimpleChanges) {

  /* ---------------- OPEN OVERLAY ---------------- */
  if (changes['isOpen']?.currentValue === true) {
    this.open();
  }

  /* ---------------- CLOSE OVERLAY ---------------- */
  if (changes['isOpen']?.currentValue === false) {
    this.close();
  }
}

  selectedFile: File | null = null;

  title = '';
  description = '';
  tags: string[] = [];
  tagInput = '';
previewUrl: string | null = null;

  /* =====================
   * LIFECYCLE
   * ===================== */

  open() {
    if (this.mode === 'edit') {
      this.openEdit();
    } else {
      this.isOpen = true;
      this.step = 1;
    }
  }

 openEdit() {
  if (!this.editData) return;

  this.isOpen = true;
  this.step = 2;

  // 🔥 TRUST BACKEND DATA
  this.fileType = this.editData.file_type;
  this.title = this.editData.name;
  this.description = this.editData.description;
  this.tags = [...this.editData.tags];

  // 🔥 DIRECTLY USE THUMBNAIL URL
  this.previewUrl = this.editData.thumbnail_link ?? null;
}


  close() {
    this.isOpen = false;
    this.closeEdit.emit();
    this.reset();
  }

  reset() {
    this.step = 1;
    this.selectedFile = null;
    this.previewUrl = null;
    this.title = '';
    this.description = '';
    this.tags = [];
    this.tagInput = '';
  }

  /* =====================
   * FILE HANDLING
   * ===================== */

 onFileSelected(event: Event) {
  if (this.mode === 'edit') return;

  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  this.selectedFile = file;
  this.title = file.name.replace(/\.[^/.]+$/, '');

  // ✅ Detect enum (same as backend)
  this.fileType = this.detectFileType(file.name);

  // ✅ Local preview (only for create)
  this.previewUrl = URL.createObjectURL(file);

  this.step = 2;
}


 handleDroppedFile(file: File) {
  if (this.mode === 'edit') return;

  this.selectedFile = file;
  this.title = file.name.replace(/\.[^/.]+$/, '');

  this.fileType = this.detectFileType(file.name);
  this.previewUrl = URL.createObjectURL(file);

  this.isOpen = true;
  this.step = 2;
}
detectFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (!ext) return FileType.OTHER;

  if (['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext)) {
    return FileType.IMAGE;
  }

  if (['mp4','mkv','avi','mov','webm','flv'].includes(ext)) {
    return FileType.VIDEO;
  }

  if (['mp3','wav','aac','flac','ogg'].includes(ext)) {
    return FileType.AUDIO;
  }

  if (['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv'].includes(ext)) {
    return FileType.DOCUMENT;
  }

  if (['zip','rar','7z','tar','gz'].includes(ext)) {
    return FileType.ARCHIVE;
  }

  if (['java','js','ts','py','cpp','c','html','css','json','xml','yaml','yml'].includes(ext)) {
    return FileType.CODE;
  }

  return FileType.OTHER;
}



  /* =====================
   * TAGS
   * ===================== */

  addTag() {
    const value = this.tagInput.trim();
    if (!value || this.tags.includes(value)) return;

    this.tags.push(value);
    this.tagInput = '';
     setTimeout(() => {
    if (this.tagsContainer) {
      this.tagsContainer.nativeElement.scrollTop =
        this.tagsContainer.nativeElement.scrollHeight;
    }
  });
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  /* =====================
   * SUBMIT
   * ===================== */

  canUpload(): boolean {
    return !!this.title.trim() && this.tags.length > 0;
  }

  submit() {
    if (!this.canUpload()) return;

    const payload = {
      file: this.selectedFile,
      title: this.title,
      description: this.description,
      tags: this.tags,
    };

    if (this.mode === 'edit') {
      console.log('Updating file:', payload);
    } else {
      console.log('Uploading file:', payload);
    }

    this.close();
  }
  @HostListener('window:dragover', ['$event'])
onDragOver(event: DragEvent) {
  if (this.mode === 'edit') return;

  event.preventDefault();
  this.isDragging = true;
}

@HostListener('window:dragleave', ['$event'])
onDragLeave(event: DragEvent) {
  event.preventDefault();
  this.isDragging = false;
}

@HostListener('window:drop', ['$event'])
onDrop(event: DragEvent) {
  if (this.mode === 'edit') return;

  event.preventDefault();
  this.isDragging = false;

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  this.handleDroppedFile(file);
}
@ViewChild('tagsContainer') tagsContainer!: ElementRef;



}
