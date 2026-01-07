import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrls:["./about.scss"],
  imports:[CommonModule]
})
export class About {

  scrollProgress = 0;

  steps = [
    'Upload',
    'Parse',
    'Tag',
    'Search',
    'Discover',
    'Collections'
  ];

  activeStep = 0;

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    this.scrollProgress = Math.min(
      100,
      Math.max(0, (scrollTop / docHeight) * 100)
    );

    this.activeStep = Math.floor(
      (this.scrollProgress / 100) * this.steps.length
    );
  }
}
