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

  @Output() clear = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
