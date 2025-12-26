import { Component } from '@angular/core';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';

@Component({
  selector: 'app-dochub',
  templateUrl: './dochub.html',
  styleUrl: './dochub.css',
  imports:[FilePriviewCard,ElaticSearchBar]
})
export class Dochub {

}
