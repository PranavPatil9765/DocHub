import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-bar',
  imports: [CommonModule],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss',
})
export class BottomBar {

  @Input() selectedCount = 0;
  @Input() selectedFileIds:string[]= [];
  @Input() mode:'collection'|'file'|'collectionFiles'= 'file';

  @Output() clear = new EventEmitter<void>();
  @Output() download = new EventEmitter<string[]>();
  @Output() delete = new EventEmitter<string[]>();
  @Output() remove = new EventEmitter<string[]>();
  onDelete(){
    this.delete.emit([...this.selectedFileIds]);
  }
  onRemove(){
    this.remove.emit([...this.selectedFileIds]);
  }
  onDownload(){
    this.download.emit([...this.selectedFileIds]);
  }

}
