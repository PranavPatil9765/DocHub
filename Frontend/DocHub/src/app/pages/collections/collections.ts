import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collections.service';
import { CollectionCardComponent } from '../../components/collection-card/collection-card';
import { BottomBar } from '../../components/bottom-bar/bottom-bar';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { AddCollectionComponent } from '../../components/add-collection/add-collection';
import { DefaultCollections } from '../../constants/constants';
import { finalize } from 'rxjs';
import { DocHubLoaderComponent } from "../../components/dochub-loader/dochub-loader";
import { CollectionRequest } from '../../models/collectionRequest.model';
import { ToastService } from '../../services/toastService';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    CollectionCardComponent,
    BottomBar,
    ElaticSearchBar,
    AddCollectionComponent,
    DocHubLoaderComponent
],
  templateUrl: './collections.html',
  styleUrl: './collections.scss'
})
export class Collections implements OnInit {

  /* ---------------- Data ---------------- */
  collections: any[] = [];
  DefaultCollections: any[] = [...DefaultCollections];
  loading = false;
  /* ---------------- Selection ---------------- */
  selectedFileIds = new Set<string>();
  clearSelectedFields = false;
  editingCollection: any = null;

  /* ---------------- Overlay ---------------- */
  showOverlay = false;
  mode: 'select' | 'edit' | 'create' | 'both' = 'create';

  constructor(private collectionService: CollectionService,private cdr:ChangeDetectorRef,private toast:ToastService) {}

  /* ---------------- API CALL ---------------- */
  ngOnInit() {
    this.loadCollections();
  }

private loadCollections() {
  this.loading = true;

  this.collectionService.getCollections()
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges()
      })
    )
    .subscribe({
      next: (res) => {
        console.log('Collections from API:', res);
        this.collections = Array.isArray(res?.data)
          ? res.data
          : [];
      },
      error: (err) => {
        console.error('Failed to load collections', err);
        this.collections = [];
      }
    });
}

  /* ---------------- Selection Logic ---------------- */
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
    setTimeout(() => (this.clearSelectedFields = false));
  }

  deleteAllSelected() {
    console.log('Delete selected:', [...this.selectedFileIds]);
    this.clearSelection();
  }

  downloadAllSelected() {
    console.log('Download selected:', [...this.selectedFileIds]);
  }

  /* ---------------- Overlay Actions ---------------- */

  openCreateCollection() {
    this.showOverlay = true;
  }

  closeOverlay() {
    this.mode = 'create';
    this.showOverlay = false;
  }

  handleCollectionEdit(e: any) {
    this.mode = 'edit';
    this.editingCollection = e;
    this.showOverlay = true;
  }

  /* ---------------- Overlay Callbacks ---------------- */

  onCreate(event:CollectionRequest) {
    this.showOverlay = false
    const newCollection:CollectionRequest = {
      name: event.name,
      icon: event.icon || '📁',
      description: event.description,
      fileIds:[]
    };
const toastId = this.toast.loading('Creating collection...');
  this.collectionService.createCollection(newCollection)
    .pipe(
      finalize(() => {

        this.cdr.detectChanges()
      })
    )
    .subscribe({
      next: (res) => {
        this.toast.success(res.message ||"Collection Created");
        this.loadCollections();
      },
      error: (err) => {
        this.toast.error(err.error.message || "Failed to create Collection")
      }
    });
}


  onSelect(collection: any) {
    console.log('Collection selected:', collection);
    this.closeOverlay();
  }
  onUpdate(e:any){
  this.showOverlay = false
  const toastId = this.toast.loading('Editing collection...');
  this.collectionService.updateCollection(e.id,e)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges()
      })
    )
    .subscribe({
      next: (res) => {
        this.showOverlay = false
        this.toast.success("Collection Updated");
        this.loadCollections();
      },
      error: (err) => {
        this.toast.error(err.error.message || "Failed to create Collection")
      }
    });

  }
}
