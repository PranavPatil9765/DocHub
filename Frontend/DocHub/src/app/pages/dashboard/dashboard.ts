import { Component } from '@angular/core';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { CardSection } from '../../components/card-section/card-section';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[ElaticSearchBar,CardSection],

})
export class DashboardComponent {}
