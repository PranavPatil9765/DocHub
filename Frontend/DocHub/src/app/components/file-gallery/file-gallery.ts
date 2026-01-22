import { FileService } from '../../services/file.service';
import { collections, DefaultFile } from './../../constants/constants';
import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { BottomBar } from '../bottom-bar/bottom-bar';
import { AddCollectionComponent } from "../add-collection/add-collection";
import { FileUploadComponent } from "../file-upload/file-upload";
import { FileRow, UploadItem } from '../../models/file.model';
import { CollectionRequest } from '../../models/collectionRequest.model';
import { CollectionService } from '../../services/collections.service';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-file-gallery',
  templateUrl: './file-gallery.html',
  styleUrls:['./file-gallery.scss'],
  imports: [
    CommonModule,
    FilePriviewCard,
    FileUploadComponent
]
})
export class FileGalleryComponent {

  @Input() files: any[] = [];
  @Input() loading = false;
  @Input() hasMore = true;
  @Input() clearFileSelection = false;

  editFile:UploadItem[] = []
  @Output() loadMore = new EventEmitter<void>();
  @Output() deleteFiles = new EventEmitter<string[]>();
  @Output() showAddCollectionOverlay = new EventEmitter<string>();
  @Output() selectionChanged = new EventEmitter<string[]>();
  @Output() downloadSelected = new EventEmitter<string[]>();
  @Output() removeSelectedFromCollection = new EventEmitter<string[]>();

  fileService = inject(FileService)
  editFileOverlayOpen = false;
  selectedFileId = ""
  selectedFileIds = new Set<string>();
  clearSelectedFields = false;
  collectionLoading = false;
  collectionService = inject(CollectionService)
  cdr = inject(ChangeDetectorRef)
  toast = inject(ToastService)

 ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearFileSelection']) {
      this.clearSelection();
    }
  }


  onScroll(event: Event) {

    if (this.loading ) return;

    const el = event.target as HTMLElement;
    const threshold = 60;

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
    this.selectionChanged.emit([...this.selectedFileIds]);
  }
  OnFileDelete(e:string[]){
   this.deleteFiles.emit(e);
  }

  clearSelection() {
    this.clearSelectedFields = true;
    this.selectedFileIds.clear();

    setTimeout(() => {
      this.clearSelectedFields = false;
    });
  }

  onShowAddCollectionOverlay(fileId:string){
    this.selectedFileId=fileId
    this.showAddCollectionOverlay.emit(this.selectedFileId);
  }

  onFileEdit(e:FileRow){
    const file:UploadItem = {
       id: e.id,
        name: e.name,
        description: e.description,
        tags: e.tags,
        stage: 'ready',
        progress:100,
      previewUrl:e.thumbnail_link,
    }
    this.editFile = [file];
    this.editFileOverlayOpen = true;
  }

  closeEdit(){
    this.editFileOverlayOpen = false;
  }



/* ---------------- Create Collection ---------------- */
onCreate(event: CollectionRequest) {

  const newCollection = {
    id: crypto.randomUUID(),
    name: event.name,
    description: event.description,
  };

  // Dummy add (prepend)
  this.files = [newCollection, ...this.files];


}

/* ---------------- Select Existing Collection ---------------- */
onSelect(collection: any) {

  // Dummy action – later replace with API call
  // this.fileService.addToCollection(fileIds, collection.id)

}

/* ---------------- Close Overlay ---------------- */
}
