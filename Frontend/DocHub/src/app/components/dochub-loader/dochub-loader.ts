import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dochub-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dochub-loader.html',
  styleUrls: ['./dochub-loader.scss']
})
export class DocHubLoaderComponent implements OnInit {
  @Input() show = false;
  isMobile = false;

  ngOnInit() {
    this.checkScreen(); // ✅ Initial screen size detection
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth < 768;
  }
}
