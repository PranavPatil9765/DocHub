import {
  Component,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DropdownComponent } from '../dropdown/dropdown';
import { FileType } from '../../models/file.model';
export interface AdvancedFilterPayload {
  fileType: FileType | null;
  minSize: number | null;
  maxSize: number | null;
  startDate: Date | null;
  endDate: Date | null;
}
@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  templateUrl: './advanced-filter.html',
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    DropdownComponent
  ]
})
export class AdvancedFilterComponent {

  @Output() applyFilters = new EventEmitter<any>();
  @Output() clearFilters = new EventEmitter<void>();

  isOpen = false;

filterForm = new FormGroup({
  dateRange: new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  }),
  size: new FormControl<{
    min: number;
    max: number | null;
  } | null>(null),
  type: new FormControl<FileType | null>(null)
});


sizeOptions = [
  { label: 'Less than 1 MB', min: 0, max: 1 },
  { label: '1 – 5 MB', min: 1, max: 5 },
  { label: '5 – 10 MB', min: 5, max: 10 },
  { label: '10 – 50 MB', min: 10, max: 50 },
  { label: 'More than 50 MB', min: 50, max: null }
];

typeOptions: { label: string; value: FileType }[] = [
  { label: 'Documents', value: FileType.DOCUMENT },
  { label: 'Images', value: FileType.IMAGE },
  { label: 'Videos', value: FileType.VIDEO },
  { label: 'Audio', value: FileType.AUDIO },
  { label: 'Archives', value: FileType.ARCHIVE },
  { label: 'Code Files', value: FileType.CODE },
  { label: 'Other Files', value: FileType.OTHER },
];


  toggle() {
    this.isOpen = !this.isOpen;
  }

 apply() {
  const { dateRange, size, type } = this.filterForm.value;

  const payload = {
    fileType: type ?? null,

    // MB → bytes
    minSize: size?.min != null ? size.min * 1024 * 1024 : null,
    maxSize: size?.max != null ? size.max * 1024 * 1024 : null,

    startDate: dateRange?.start ?? null,
    endDate: dateRange?.end ?? null
  };

  this.applyFilters.emit(payload);
  this.isOpen = false;
}


  clear() {
    this.filterForm.reset();
    this.clearFilters.emit();
  }

 @HostListener('document:click', ['$event'])
close(event: Event) {
  const target = event.target as HTMLElement;

  const clickedInsideFilter =
    target.closest('.filter-wrapper');

  const clickedInsideMaterialOverlay =
    target.closest('.cdk-overlay-pane');

  if (!clickedInsideFilter && !clickedInsideMaterialOverlay) {
    this.isOpen = false;
  }
}
get hasActiveFilters(): boolean {
  const { dateRange, size, type } = this.filterForm.value;

  return !!(
    size ||
    type ||
    dateRange?.start ||
    dateRange?.end
  );
}

}
