import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-priview-card',
  templateUrl: './file-priview-card.html'
})
export class FilePriviewCard {
  @Input() fileUrl!: string;
  @Input() fileName!: string;
  @Input() fileSize!: number;
  @Input() fileType!: string;

  safeUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.isPdf) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.fileUrl
      );
    }
  }

  get isImage() {
    return this.fileType.startsWith('image/');
  }

  get isPdf() {
    return this.fileType === 'application/pdf';
  }
}
