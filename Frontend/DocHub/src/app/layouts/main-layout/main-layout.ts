import { Component, HostListener } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from "../../components/file-upload/file-upload";

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  imports: [Navbar, Sidebar, RouterModule]
})
export class MainLayout {
  isSidebarOpen = false;
  isMobile = false;

  constructor() {
    this.checkScreen();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
  }
}
