import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-gallery',
  templateUrl: './file-gallery.html',
  imports:[FilePriviewCard,CommonModule]
})
export class FileGalleryComponent {

  @Input() files: any[] = [];
  @Input() loading = false;
  @Input() hasMore = true;
  @Output() loadMore = new EventEmitter<void>();
  clearSelectedFields = false;
  onScroll(event: Event) {
    if (this.loading || !this.hasMore) return;

    const el = event.target as HTMLElement;
    const threshold = 80;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      this.loadMore.emit();
    }
  }

  selectedFileIds = new Set<string>();

onFileSelectionChange(event:any) {
  if (event.selected) {
    this.selectedFileIds.add(event.id);
  } else {
    this.selectedFileIds.delete(event.id);
  }
}

clearSelection() {
  this.clearSelectedFields = true;
  this.selectedFileIds.clear();
    setTimeout(() => {
    this.clearSelectedFields = false;
  });

}

deleteAllSelected() {
  this.files = this.files.filter(
    f => !this.selectedFileIds.has(f.id)
  );
  this.clearSelection();
}

downloadAllSelected() {
  const selectedFiles = this.files.filter(
    f => this.selectedFileIds.has(f.id)
  );

  console.log('Downloading:', selectedFiles);
}

}
