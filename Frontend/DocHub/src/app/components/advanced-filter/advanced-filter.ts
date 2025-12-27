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
    size: new FormControl(null),
    type: new FormControl(null)
  });

  sizeOptions = [
    { id: 'lt_1', label: 'Less than 1 MB', min: 0, max: 1 },
    { id: '1_5', label: '1 – 5 MB', min: 1, max: 5 },
    { id: '5_10', label: '5 – 10 MB', min: 5, max: 10 },
    { id: '10_50', label: '10 – 50 MB', min: 10, max: 50 },
    { id: 'gt_50', label: 'More than 50 MB', min: 50, max: null }
  ];

  typeOptions = [
    { id: 'pdf', label: 'PDF (.pdf)' },
    { id: 'doc', label: 'Word (.doc, .docx)' },
    { id: 'xls', label: 'Excel (.xls, .xlsx)' },
    { id: 'ppt', label: 'Presentation (.ppt, .pptx)' },
    { id: 'image', label: 'Image (.jpg, .png)' }
  ];

  toggle() {
    this.isOpen = !this.isOpen;
  }

  apply() {
    this.applyFilters.emit(this.filterForm.value);
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
