import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElaticSearchBar } from '../elatic-search-bar/elatic-search-bar';

@Component({
  selector: 'app-add-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, ElaticSearchBar],
  templateUrl: './add-collection.html',
  styleUrls: ['./add-collection.scss'],
})
export class AddCollectionComponent implements OnChanges {

  /* ---------------- Inputs ---------------- */
  @Input() collections: any[] = [];
  @Input() mode: 'create' | 'edit' | 'select' | 'both' = 'both';
  @Input() editingCollection: any | null = null;

  /* ---------------- Outputs ---------------- */
  @Output() close = new EventEmitter<void>();
  @Output() createCollection = new EventEmitter<any>();
  @Output() updateCollection = new EventEmitter<any>();
  @Output() selectCollection = new EventEmitter<any>();

  /* ---------------- Form State ---------------- */
  name = '';
  description = '';
  error = '';

  /* ---------------- Icon Picker ---------------- */
  icons = ['📄', '🗂️', '🖼️', '🎓', '🧩', '📚', '🎥', '🗄️'];
  selectedIcon = '📄';

  /* ---------------- Lifecycle ---------------- */
  ngOnChanges() {
    if (this.mode === 'edit' && this.editingCollection) {
      this.name = this.editingCollection.name;
      this.description = this.editingCollection.description || '';
      this.selectedIcon = this.editingCollection.icon || '📄';
    }
  }

  /* ---------------- Save (Create / Edit) ---------------- */
  save() {
    const trimmed = this.name.trim();

    if (!trimmed) {
      this.error = 'Collection name is required';
      return;
    }

    const exists = this.collections.some(c =>
      c.name.toLowerCase() === trimmed.toLowerCase() &&
      c.id !== this.editingCollection?.id
    );

    if (exists) {
      this.error = 'Collection already exists';
      return;
    }

    const payload = {
      ...(this.editingCollection || {}),
      name: trimmed,
      description: this.description?.trim() || undefined,
      icon: this.selectedIcon,
    };

    if (this.mode === 'edit') {
      this.updateCollection.emit(payload);
    } else {
      this.createCollection.emit(payload);
    }

    this.reset();
  }

  /* ---------------- Select ---------------- */
  select(col: any) {
    this.selectCollection.emit(col);
  }

  selectIcon(icon: string) {
    this.selectedIcon = icon;
  }

  reset() {
    this.name = '';
    this.description = '';
    this.selectedIcon = '📄';
    this.error = '';
  }
}
