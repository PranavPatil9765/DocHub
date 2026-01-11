import { Component, Input, input } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { RouterModule } from "@angular/router";
import { FileRow } from '../../models/file-row';
import { dummyFiles } from '../../constants/constants';

@Component({
  selector: 'app-card-section',
  imports: [FilePriviewCard, RouterModule],
  templateUrl: './card-section.html',
  styleUrl: './card-section.scss',
})
export class CardSection {
  @Input() title = "";
  @Input() files:FileRow[] = dummyFiles;
  @Input() multiselect:boolean = true;

}
