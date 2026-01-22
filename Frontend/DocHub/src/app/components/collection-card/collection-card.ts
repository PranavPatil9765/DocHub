import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-card',
  standalone: true,
  templateUrl: './collection-card.html',
  imports:[CommonModule]
})
export class CollectionCardComponent {

  /* =====================
   *  DISPLAY CONFIG
   * ===================== */

  // 'default' → image + title
  // 'normal'  → icon + title + interactions
  @Input() collection:any = null;
  // Used only in DEFAULT state
  @Input() imageUrl?: string;

  // Used only in NORMAL state
  @Input() icon = '📁';
  @Input() clearSelection = false;
  @Input() multiselectActive = false;

  /* =====================
   *  SELECTION
   * ===================== */

  @Input() multiselect = false;
  @Input() selected = false;

  @Output() selectionChange = new EventEmitter<any>();

  @Output() open = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<void>();

  menuOpen = false;


  /* =====================
   *  METHODS
   * ===================== */

  constructor( private cdr: ChangeDetectorRef ,private router: Router) {}


  ngOnChanges(changes: SimpleChanges) {
  if (changes['clearSelection']?.currentValue) {
    this.selected = false;
  }
}

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  private updateSelection(selected: boolean) {
  this.selected = selected;
  this.selectionChange.emit({
    id: this.collection?.id,
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
  if(this.collection.state ==='default'){
         this.router.navigate(['/collections/default', this.collection.name]);

  }else{

    this.router.navigate(['/collections', this.collection.id]);
  }

  // normal click behavior
  this.open.emit();
}


  closeMenu() {
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
      this.cdr.markForCheck();

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
handleEdit(e:Event){
  e.stopPropagation()
  this.edit.emit({id:this.collection?.id,name:this.collection?.name,icon:this.collection.icon,description:this.collection.description});
}

 @HostListener('document:click', ['$event'])
  close(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.card-wrapper')) {
      this.menuOpen = false;
    }
  }
}
