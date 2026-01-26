import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { RouterModule } from "@angular/router";
import { FileRow } from '../../models/file.model';
import { dummyFiles } from '../../constants/constants';
import { FileUploadComponent } from "../file-upload/file-upload";
import { mapStatusToStage } from '../../../utilities/file-functions';

@Component({
  selector: 'app-card-section',
  imports: [FilePriviewCard, RouterModule, FileUploadComponent],
  templateUrl: './card-section.html',
  styleUrl: './card-section.scss',
})
export class CardSection {
    editFile:FileRow[] = []
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
    this.editFile = [e];
    this.editFileOverlayOpen = true;
  }

}
