import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar,Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  isSidebarOpen = false;
  isMobile = false;

  constructor() {
    this.checkScreen();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigate(page:string){
    Router.
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isSidebarOpen = true; // desktop always open
    }
  }
}
