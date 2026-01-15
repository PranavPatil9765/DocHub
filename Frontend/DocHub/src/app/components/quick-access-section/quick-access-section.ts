import { Component, Input } from '@angular/core';
import { getFileClasses } from '../../../utilities/file-type.styles';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FILE_TYPE_BG, FILE_TYPE_COLOR, FILE_TYPE_ICON, FileRow, FileType } from '../../models/file.model';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-quick-access-section',
  imports: [CommonModule,RouterModule],
  templateUrl: './quick-access-section.html',
  styleUrl: './quick-access-section.scss',
})
export class QuickAccessSection {
    private api = `${environment.apiBaseUrl}`;

  FILE_TYPE_ICON:Record<FileType, string> = FILE_TYPE_ICON;
FILE_TYPE_COLOR:Record<FileType, string> = FILE_TYPE_COLOR;
FILE_TYPE_BG = FILE_TYPE_BG;
  @Input() title:string = "Frequently Used";
  @Input() files:FileRow[] = [];
  @Input() link:string = "";

  onPreview(fileId:string) {
    const url = `${this.api}/files/preview/${fileId}`;
    window.open(url, '_blank');
  }
  onViewAll(){}

}
