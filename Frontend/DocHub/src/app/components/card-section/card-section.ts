import { Component, Input, input } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-card-section',
  imports: [FilePriviewCard, RouterModule],
  templateUrl: './card-section.html',
  styleUrl: './card-section.scss',
})
export class CardSection {
  @Input() title = "";
  @Input() card = [];
  @Input() multiselect:boolean = true;

}
