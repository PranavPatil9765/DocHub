import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  imports:[RouterLink]
})
export class Sidebar {
  @Input() isMobile = false;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<string>();

  currentUrl: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });

  }

  itemClick(page:string){
    this.onClick.emit(page);
  }
}
