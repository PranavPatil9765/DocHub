import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface StorageSlice {
  type: string;
  sizeGB: number;
  color: string;
}

@Component({
  selector: 'app-storage-usage',
  standalone: true,
  templateUrl: './storage-usage.html',
  imports:[CommonModule]
})
export class StorageUsageComponent {

  @Input() totalStorageGB = 100;

  @Input() usedStorage: StorageSlice[] = [
    { type: 'PDF Documents', sizeGB: 32, color: 'bg-blue-600' },
    { type: 'Images', sizeGB: 18, color: 'bg-blue-400' },
    { type: 'Word Files', sizeGB: 12, color: 'bg-blue-300' },
    { type: 'Videos', sizeGB: 8, color: 'bg-blue-500' }
  ];

  get usedGB(): number {
    return this.usedStorage.reduce((a, b) => a + b.sizeGB, 0);
  }

  get remainingGB(): number {
    return this.totalStorageGB - this.usedGB;
  }

hoveredSlice: { type: string; sizeGB: number } | null = null;

tooltipX = 0;
tooltipY = 0;

onMouseEnter(slice: { type: string; sizeGB: number }) {
  this.hoveredSlice = slice;
}

onMouseMove(event: MouseEvent) {
  this.tooltipX = event.clientX + 12;
  this.tooltipY = event.clientY - 10;
}

onMouseLeave() {
  this.hoveredSlice = null;
}


  getPercentage(size: number): number {
    return (size / this.totalStorageGB) * 100;
  }
}
