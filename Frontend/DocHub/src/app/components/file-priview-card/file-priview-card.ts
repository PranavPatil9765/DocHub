import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getExtension } from '../../../utilities/file-functions';
import { FileRow } from '../../models/file-row';
import { DefaultFile } from '../../constants/constants';
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
  @Output() addToCollection = new EventEmitter<any>();
  safeUrl!: SafeResourceUrl;
  getExtension = getExtension;
  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.isPdf) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.file?.url
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['clearSelection']?.currentValue) {
    this.selected = false;
  }
}


 get isImage(): boolean {
  const ext = this.getExtension(this.file.url || this.file.name);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

get isPdf(): boolean {
  const ext = this.getExtension(this.file.url || this.file.name);
  return ext === 'pdf';
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
  }

  // normal click behavior
}


onPreview() {
  this.menuOpen = false;
}

onDownload() {
  if (!this.file?.url) return;

  const link = document.createElement('a');
  link.href = this.file.url;
  link.download = this.file.name;
  link.target = '_blank';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onDelete() {
  this.menuOpen = false;
}
onAddCollection(){
  this.addToCollection.emit(this.file.id);
}
onEdit(){
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
