import { Component } from '@angular/core';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { DropdownComponent } from '../../components/dropdown/dropdown';
import { AdvancedFilterComponent } from "../../components/advanced-filter/advanced-filter";

@Component({
  selector: 'app-dochub',
  templateUrl: './dochub.html',
  styleUrl: './dochub.css',
  imports: [FilePriviewCard, ElaticSearchBar, DropdownComponent, AdvancedFilterComponent]
})
export class Dochub {
  categories = [
  { id: 1, name: 'Documents' },
  { id: 2, name: 'Images' },
  { id: 3, name: 'Videos' }
];
// form = new FormGroup({
//   category: new FormControl(null)
// });


}
