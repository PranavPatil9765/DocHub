import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileRow } from '../../models/file.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.html',
  imports:[CommonModule,ConfirmDialogComponent]
})



export class FileTableComponent {

  /* ---------- INPUTS ---------- */
  @Input() files: FileRow[] = [];
  @Input() loading = false;
  @Input() hasMore = true;
  @Input() selectable = true;

  /* ---------- OUTPUTS ---------- */
  @Output() loadMore = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<FileRow[]>();
  @Output() open = new EventEmitter<FileRow>();
  @Output() download = new EventEmitter<FileRow>();
  @Output() edit = new EventEmitter<FileRow>();
  @Output() delete = new EventEmitter<FileRow>();
  @Output() deleteSelected = new EventEmitter<string[]>();
  @Output() downloadSelected = new EventEmitter<string[]>();
  @Output() clearSelection = new EventEmitter<void>();


  selected = new Set<string>();
  showDeleteConfirm = false;
  /* ---------- SELECTION ---------- */
  toggleAll(checked: boolean) {
    if (checked) {
      this.files.forEach(f => this.selected.add(f.id));
    } else {
      this.selected.clear();
    }
    this.emitSelection();
  }

  toggleOne(id: string) {
    this.selected.has(id)
      ? this.selected.delete(id)
      : this.selected.add(id);
    this.emitSelection();
  }

  isAllSelected() {
    return this.files.length > 0 && this.selected.size === this.files.length;
  }

  emitSelection() {
    this.selectionChange.emit(
      this.files.filter(f => this.selected.has(f.id))
    );
  }

  /* ---------- UTILS ---------- */
  readableSize(bytes: number) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  icon(type: string) {
    return `assets/icons/${type}.svg`;
  }

  get selectedCount(): number {
  return this.selected.size;
}

clearAllSelection() {
  this.selected.clear();
  this.emitSelection();
  this.clearSelection.emit();
}

deleteAllSelected() {
  const ids = Array.from(this.selected);
  this.deleteSelected.emit(ids);
}

downloadAllSelected() {
  const ids = Array.from(this.selected);
  this.downloadSelected.emit(ids);
}

  /* ---------- INFINITE SCROLL ---------- */
  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    const atBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

    if (atBottom && !this.loading && this.hasMore) {
      this.loadMore.emit();
    }
  }
}
