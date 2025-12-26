import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html'
})
export class Navbar {
  @Input() isMobile = false;
  @Output() menuClick = new EventEmitter<void>();
}
