import { FILE_TYPE_COLOR, FILE_TYPE_ICON, SearchSuggestion } from './../../models/file.model';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileRow } from '../../models/file.model';
import { ElaticSearchBar } from "../elatic-search-bar/elatic-search-bar";

@Component({
  selector: 'app-file-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ElaticSearchBar],
  templateUrl: './file-table.html'
})
export class FileTableComponent {

  /* ---------- INPUTS ---------- */
  @Input() files: FileRow[] = [];
  @Input() loading = false;
  @Input() hasMore = true;
  @Input() selectable = true;
  FILE_TYPE_COLOR = FILE_TYPE_COLOR
  FILE_TYPE_ICON = FILE_TYPE_ICON
  @Input() FileSearchSuggestions:SearchSuggestion[] = []
  /* ---------- OUTPUTS ---------- */
  @Output() loadMore = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<FileRow[]>();
  @Output() searchSuggestion = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  /* ---------- UI STATE ---------- */
  showOverlay = false;

  /* ---------- SELECTION ---------- */
  selected = new Set<string>();

  openOverlay() {
    this.loadMore.emit();
    this.showOverlay = true;
  }

  closeOverlay() {
    this.showOverlay = false;
    this.clearAllSelection();
  }

  toggleOne(id: string) {
    this.selected.has(id)
      ? this.selected.delete(id)
      : this.selected.add(id);
  }

  get selectedCount(): number {
    return this.selected.size;
  }

  clearAllSelection() {
    this.selected.clear();
  }

  confirmSelection() {
    const selectedFiles = this.files.filter(f =>
      this.selected.has(f.id)
    );
    this.confirm.emit(selectedFiles);
    this.closeOverlay();
  }



  /* ---------- UTILS ---------- */
  readableSize(bytes: number) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  icon(type: string) {
    return `assets/icons/${type}.svg`;
  }

  /* ---------- INFINITE SCROLL ---------- */
  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (
      el.scrollHeight - el.scrollTop <= el.clientHeight + 50 &&
      !this.loading &&
      this.hasMore
    ) {
      this.loadMore.emit();
    }
  }
}
