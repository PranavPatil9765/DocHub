import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { RouterModule } from "@angular/router";
import { FileRow, UploadItem } from '../../models/file.model';
import { dummyFiles } from '../../constants/constants';
import { FileUploadComponent } from "../file-upload/file-upload";

@Component({
  selector: 'app-card-section',
  imports: [FilePriviewCard, RouterModule, FileUploadComponent],
  templateUrl: './card-section.html',
  styleUrl: './card-section.scss',
})
export class CardSection {
    editFile:UploadItem[] = []
    editFileOverlayOpen = false;
selectedFileId:string = ""
  @Input() title = "";
  @Input() files:FileRow[] = dummyFiles;
  @Input() multiselect:boolean = true;
  @Output() showAddCollectionOverlay = new EventEmitter<string>();
  @Output() deleteFiles = new EventEmitter<string[]>();

   closeEdit(){
    this.editFileOverlayOpen = false;
  }
  OnFileDelete(e:string[]){
   this.deleteFiles.emit(e);
  }
 onShowAddCollectionOverlay(fileId:string){
    this.selectedFileId=fileId
    this.showAddCollectionOverlay.emit(this.selectedFileId);
  }

  onFileEdit(e:FileRow){
    const file:UploadItem = {
       id: e.id,
        name: e.name,
        description: e.description,
        tags: e.tags,
        stage: 'ready',
        progress:100,
      previewUrl:e.thumbnail_link,
    }
    this.editFile = [file];
    this.editFileOverlayOpen = true;
  }

}
