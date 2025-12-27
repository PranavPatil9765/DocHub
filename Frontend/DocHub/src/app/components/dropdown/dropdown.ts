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

  @Output() valueChange = new EventEmitter<any>();
  @Output() cleared = new EventEmitter<void>();

  isOpen = false;
  selected: any = null;
  disabled = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  select(option: any) {
    if (this.disabled) return;

    this.selected = option;
    this.isOpen = false;

    const value = option[this.valueKey];
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  clear(event: MouseEvent) {
    event.stopPropagation(); // prevent dropdown toggle

    this.selected = null;
    this.isOpen = false;

    this.onChange(null);
    this.onTouched();
    this.cleared.emit();
  }

  /** CVA methods */
  writeValue(value: any): void {
    this.selected =
      this.options.find(opt => opt[this.valueKey] === value) || null;
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
