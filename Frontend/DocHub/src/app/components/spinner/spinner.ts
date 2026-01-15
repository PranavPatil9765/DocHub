import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.scss']
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
