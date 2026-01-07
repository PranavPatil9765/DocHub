import { collections as COLLECTIONS_CONST, DefaultCollections } from './../../constants/constants';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CollectionCardComponent } from '../../components/collection-card/collection-card';
import { BottomBar } from '../../components/bottom-bar/bottom-bar';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { AddCollectionComponent } from '../../components/add-collection/add-collection';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    CollectionCardComponent,
    BottomBar,
    ElaticSearchBar,
    AddCollectionComponent
  ],
  templateUrl: './collections.html',
  styleUrl: './collections.scss',
})
export class Collections {

  /* ---------------- Data ---------------- */
  collections: any[] = [...COLLECTIONS_CONST];
  DefaultCollections:any[] = DefaultCollections
  /* ---------------- Selection ---------------- */
  selectedFileIds = new Set<string>();
  clearSelectedFields = false;
  editingCollection = null

  /* ---------------- Overlay ---------------- */
  showOverlay = false;
  mode: "select" | "edit" | "create" | "both" = "create"
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

    setTimeout(() => {
      this.clearSelectedFields = false;
    });
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
    this.mode = "create"
    this.showOverlay = false;
  }

  handleCollectionEdit(e:any){

    this.mode = "edit"
    this.editingCollection = e;
    this.showOverlay = true;
  }
  /* ---------------- Overlay Callbacks ---------------- */

  onCreate(event: { name: string; description?: string; icon?: string }) {
    const newCollection = {
      id: crypto.randomUUID(),
      name: event.name,           // optional, for consistency
      icon: event.icon || '📁',
      description: event.description,
      state: 'normal',
    };

    this.collections = [newCollection, ...this.collections];
    this.closeOverlay();
  }

  onSelect(collection: any) {
    console.log('Collection selected:', collection);
    this.closeOverlay();
  }
}
