import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FileUploadComponent } from "../file-upload/file-upload";
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [FileUploadComponent, RouterLink, RouterModule],
})
export class Navbar {
  @Input() isMobile = false;
  @Output() menuClick = new EventEmitter<void>();
   isProfileOpen = false;
  username = 'Pranav';

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  logout() {
    this.closeProfile();
    // call logout logic here
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.closeProfile();
    }
  }
}
