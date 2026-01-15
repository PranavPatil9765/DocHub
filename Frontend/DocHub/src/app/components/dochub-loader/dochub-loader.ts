import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dochub-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dochub-loader.html',
  styleUrls: ['./dochub-loader.scss']
})
export class DocHubLoaderComponent {
  @Input() show = false;
  isMobile = false;
   @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth < 768;
  }
}
