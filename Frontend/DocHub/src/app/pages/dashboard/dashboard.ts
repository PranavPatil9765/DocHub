import { Component } from '@angular/core';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[ElaticSearchBar],

})
export class DashboardComponent {}
