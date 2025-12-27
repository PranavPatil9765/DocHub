import { Component, Input, input } from '@angular/core';
import { FilePriviewCard } from '../file-priview-card/file-priview-card';

@Component({
  selector: 'app-card-section',
  imports: [FilePriviewCard],
  templateUrl: './card-section.html',
  styleUrl: './card-section.scss',
})
export class CardSection {
  @Input() title = "";
  @Input() card = [];

}
