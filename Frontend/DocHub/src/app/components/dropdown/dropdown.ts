import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {

  @Input() label = 'Select';
  @Input() options: any[] = [];
  @Input() displayKey = 'label';
  @Input() valueKey = 'value';
  @Input() checkbox = false; // ✅ NEW

  @Output() valueChange = new EventEmitter<any>();
  @Output() cleared = new EventEmitter<void>();

  isOpen = false;
  disabled = false;

  // 🔹 Single select
  selected: any = null;

  // 🔹 Multi select
  selectedValues: any[] = [];

  private onChange = (_: any) => {};
  private onTouched = () => {};

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  /** SINGLE SELECT */
  select(option: any) {
    if (this.disabled || this.checkbox) return;

    this.selected = option;
    this.isOpen = false;

    const value = option[this.valueKey];
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  /** MULTI SELECT */
  toggleCheckbox(option: any, event: Event) {
    event.stopPropagation();

    const value = option[this.valueKey];
    const index = this.selectedValues.indexOf(value);

    if (index === -1) {
      this.selectedValues.push(value);
    } else {
      this.selectedValues.splice(index, 1);
    }

    this.onChange([...this.selectedValues]);
    this.onTouched();
    this.valueChange.emit([...this.selectedValues]);
  }

  isChecked(option: any): boolean {
    return this.selectedValues.includes(option[this.valueKey]);
  }

  clear(event: MouseEvent) {
    event.stopPropagation();

    this.selected = null;
    this.selectedValues = [];
    this.isOpen = false;

    this.onChange(this.checkbox ? [] : null);
    this.onTouched();
    this.cleared.emit();
  }

  /** CVA */
  writeValue(value: any): void {
    if (this.checkbox) {
      this.selectedValues = Array.isArray(value) ? value : [];
    } else {
      this.selected =
        this.options.find(opt => opt[this.valueKey] === value) || null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Click outside */
  @HostListener('document:click', ['$event'])
  close(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.isOpen = false;
    }
  }
}
