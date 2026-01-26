import { FILE_TYPE_COLOR, FILE_TYPE_ICON, SearchSuggestion, FileType } from './../../models/file.model';
import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FileSearchService } from '../../services/file-search.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-elatic-search-bar',
  standalone: true,
  templateUrl: './elatic-search-bar.html',
  styleUrl: './elatic-search-bar.css',
  imports: [CommonModule]
})
export class ElaticSearchBar {

  FILE_TYPE_ICON = FILE_TYPE_ICON;
  FILE_TYPE_COLOR = FILE_TYPE_COLOR;

  /** ✅ NEW INPUT */
  @Input() placeholder = 'Search files...'
  @Input() showSuggestionsEnabled = true;

  @Output() searchSuggestion = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  query = '';
  @Input() suggestions: SearchSuggestion[] = [];
  showSuggestions = false;

  private search$ = new Subject<string>();

  constructor(
    private fileSearch: FileSearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {

        this.searchSuggestion.emit(value);

        if (!value || value.length < 2) {
          this.suggestions = [];
          this.showSuggestions = false;
          return;
        }

         // If suggestions exist (from parent), show them
        if (this.suggestions.length) {
          this.showSuggestions = true;
        }

        this.cdr.detectChanges();

      });
  }

  onInput(event: Event) {
    this.query = (event.target as HTMLInputElement).value;
    this.search$.next(this.query);
  }

  onFocus() {
    if (this.showSuggestionsEnabled && this.suggestions.length) {
      this.showSuggestions = true;
    }
  }

  emitSearch() {
    this.showSuggestions = false;
    this.search.emit(this.query);
  }

  onselectSuggestion(file: SearchSuggestion) {
    this.query = file.name;
    this.showSuggestions = false;
    this.search.emit(this.query);
  }


  @HostListener('document:click', ['$event'])
  close(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) {
      this.showSuggestions = false;
    }
  }
}
