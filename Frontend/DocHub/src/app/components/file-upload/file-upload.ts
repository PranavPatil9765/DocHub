import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileRow } from '../../models/file-row';
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
  previewUrl: SafeResourceUrl | null = null;
  fileType: any = null;

  title = '';
  description = '';
  tags: string[] = [];
  tagInput = '';

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

    this.fileType = this.editData.type;
    this.title = this.editData.name;
    this.description = this.editData.description;
    this.tags = [...this.editData.tags];

    if (this.editData.url) {
      this.previewUrl =
        this.fileType === 'pdf' || this.fileType === 'image'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(this.editData.url)
          : null;
    }
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
    this.fileType = null;
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

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (file.type.startsWith('image/')) {
      this.fileType = 'image';
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );
    } else if (ext === 'pdf') {
      this.fileType = 'pdf';
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );
    } else if (['doc', 'docx'].includes(ext!)) {
      this.fileType = 'doc';
    } else if (['ppt', 'pptx'].includes(ext!)) {
      this.fileType = 'ppt';
    } else if (['xls', 'xlsx'].includes(ext!)) {
      this.fileType = 'xls';
    } else {
      this.fileType = 'other';
    }

    this.step = 2;
  }

  handleDroppedFile(file: File) {
  this.selectedFile = file;
  this.title = file.name.replace(/\.[^/.]+$/, '');

  const ext = file.name.split('.').pop()?.toLowerCase();

  if (file.type.startsWith('image/')) {
    this.fileType = 'image';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
  } else if (ext === 'pdf') {
    this.fileType = 'pdf';
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
  } else if (['doc', 'docx'].includes(ext!)) {
    this.fileType = 'doc';
  } else if (['ppt', 'pptx'].includes(ext!)) {
    this.fileType = 'ppt';
  } else if (['xls', 'xlsx'].includes(ext!)) {
    this.fileType = 'xls';
  } else {
    this.fileType = 'other';
  }

  this.isOpen = true;
  this.step = 2;
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
