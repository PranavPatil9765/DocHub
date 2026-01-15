import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getExtension } from '../../../utilities/file-functions';
import { FILE_TYPE_COLOR, FILE_TYPE_ICON, FileRow } from '../../models/file.model';
import { DefaultFile } from '../../constants/constants';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';
@Component({
  selector: 'app-file-priview-card',
  templateUrl: './file-priview-card.html',
  imports: [CommonModule],
})
export class FilePriviewCard {
  @Input() file:FileRow = DefaultFile
  @Input() multiselect:boolean = true;
  @Input() multiselectActive:boolean = false;
  @Input() clearSelection = false;
  @Output() selectionChange = new EventEmitter<any>();
  @Output() edit = new EventEmitter<FileRow>();
  @Output() showAddCollectionOverlay = new EventEmitter<string>();
  safeUrl!: SafeResourceUrl;
  FILE_TYPE_ICON = FILE_TYPE_ICON;
  FILE_TYPE_COLOR = FILE_TYPE_COLOR;
  private api = `${environment.apiBaseUrl}`;
  previewUrl = "";
  private http = inject(HttpClient)
  getExtension = getExtension;
  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if(this.file.thumbnail_link){
      this.previewUrl = `${this.api}${this.file.thumbnail_link}`;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['clearSelection']?.currentValue) {
    this.selected = false;
  }
}



 menuOpen = false;
selected = false;

toggleMenu(event: MouseEvent) {
  event.stopPropagation();
  this.menuOpen = !this.menuOpen;
}

  private updateSelection(selected: boolean) {
  this.selected = selected;
  this.selectionChange.emit({
    id: this.file.id,
    selected
  });
}
onSelectChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.updateSelection(checked);
}
onCardClick(event: MouseEvent) {
  if (this.multiselectActive) {
    event.stopPropagation();
    this.updateSelection(!this.selected);
    return;
  }else{
    this.onPreview();
  }

  // normal click behavior
}


onPreview() {
  const url = `${this.api}/files/preview/${this.file.id}`;
  window.open(url, '_blank');

  this.menuOpen = false;
}
 downloadUrl = `${this.api}/files/download/${this.file.id}`;
onDownload() {
  const url = `${this.api}/files/download/${this.file.id}`;

  this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);

    a.href = objectUrl;
    a.download = this.file.name;
    a.click();

    URL.revokeObjectURL(objectUrl);
  });
}


onDelete() {
  this.menuOpen = false;
}
onShowAddCollectionOverlay(e:Event){
  e.stopPropagation();
  this.showAddCollectionOverlay.emit(this.file.id);
}
onEdit(e:Event){
  e.stopPropagation()
  this.edit.emit(this.file);
}

private pressTimer: any;
private longPressTriggered = false;
LONG_PRESS_DELAY = 500; // ms

onTouchStart() {
  if (!this.multiselect) return;

  this.longPressTriggered = false;

  this.pressTimer = setTimeout(() => {
    this.longPressTriggered = true;

    // 🔁 toggle selection
    this.selected = !this.selected;

    this.onSelectChange({
      target: { checked: this.selected }
    } as any);
      this.cdr.markForCheck(); // ✅ KEY LINE

    // optional haptic feedback
    navigator.vibrate?.(15);
  }, this.LONG_PRESS_DELAY);
}

onTouchEnd() {
  clearTimeout(this.pressTimer);
}

onTouchMove() {
  clearTimeout(this.pressTimer);
}


 @HostListener('document:click', ['$event'])
  close(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.card-wrapper')) {
      this.menuOpen = false;
    }
  }
}
