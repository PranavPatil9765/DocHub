import { collections, DefaultFile } from './../../constants/constants';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { BottomBar } from '../bottom-bar/bottom-bar';
import { AddCollectionComponent } from "../add-collection/add-collection";
import { FileUploadComponent } from "../file-upload/file-upload";
import { FileRow } from '../../models/file-row';
@Component({
  selector: 'app-file-gallery',
  templateUrl: './file-gallery.html',
  styleUrls:['./file-gallery.scss'],
  imports: [
    CommonModule,
    FilePriviewCard,
    BottomBar,
    AddCollectionComponent,
    FileUploadComponent
]
})
export class FileGalleryComponent {

  @Input() files: any[] = [];
  @Input() loading = false;
  @Input() hasMore = true;
  editFile:FileRow = DefaultFile
  @Output() loadMore = new EventEmitter<void>();
  editFileOverlayOpen = false;
  selectedFileId = ""
  selectedFileIds = new Set<string>();
  clearSelectedFields = false;
  collections = collections

  onScroll(event: Event) {
    if (this.loading || !this.hasMore) return;

    const el = event.target as HTMLElement;
    const threshold = 80;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      this.loadMore.emit();
    }
  }

  onFileSelectionChange(event: { id: string; selected: boolean }) {
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
  onAddToCollection(fileId:string){
    this.selectedFileId=fileId
    this.showOverlay=true;
  }

  onFileEdit(e:FileRow){
    console.log("File to edit",e);
    this.editFile = e;
    this.editFileOverlayOpen = true;
  }

  closeEdit(){
    this.editFileOverlayOpen = false;
  }

showOverlay = false;

/* ---------------- Create Collection ---------------- */
onCreate(event: { name: string; description?: string }) {
  console.log('Create collection triggered:', event);

  const newCollection = {
    id: crypto.randomUUID(),
    name: event.name,
    description: event.description,
  };

  // Dummy add (prepend)
  this.files = [newCollection, ...this.files];

  console.log('Updated collections list:', this.files);

  this.closeOverlay();
}

/* ---------------- Select Existing Collection ---------------- */
onSelect(collection: any) {
  console.log('Collection selected:', collection);

  // Dummy action – later replace with API call
  // this.fileService.addToCollection(fileIds, collection.id)

  this.closeOverlay();
}

/* ---------------- Close Overlay ---------------- */
closeOverlay() {
  console.log('Overlay closed');
  this.showOverlay = false;
}
}
