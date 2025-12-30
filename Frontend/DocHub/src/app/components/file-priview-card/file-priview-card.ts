import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getExtension } from '../../../utilities/file-functions';
@Component({
  selector: 'app-file-priview-card',
  templateUrl: './file-priview-card.html',
  imports: [CommonModule],
})
export class FilePriviewCard {
  @Input() fileUrl!: string;
  @Input() fileName!: string;
  @Input() fileSize!: number;
  @Input() fileType!: string;
  @Input() multiselect:boolean = true;
  @Input() fileId:string = "";
  @Input() clearSelection = false;
  @Output() selectionChange = new EventEmitter<any>();
  safeUrl!: SafeResourceUrl;
  getExtension = getExtension;
  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.isPdf) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.fileUrl
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['clearSelection']?.currentValue) {
    this.selected = false;
  }
}


 get isImage(): boolean {
  const ext = this.getExtension(this.fileUrl || this.fileName);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

get isPdf(): boolean {
  const ext = this.getExtension(this.fileUrl || this.fileName);
  return ext === 'pdf';
}

 menuOpen = false;
selected = false;

toggleMenu(event: MouseEvent) {
  event.stopPropagation();
  this.menuOpen = !this.menuOpen;
}

onSelectChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.selected = checked;
  this.selectionChange.emit({id:this.fileId,selected:this.selected});
  console.log('Selected:', checked);
}

onPreview() {
  this.menuOpen = false;
}

onDownload() {
  this.menuOpen = false;
}

onDelete() {
  this.menuOpen = false;
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
