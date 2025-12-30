import { Component } from '@angular/core';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { CardSection } from '../../components/card-section/card-section';
import { QuickAccessSection } from '../../components/quick-access-section/quick-access-section';
import { StatsCard } from '../../components/stats-card/stats-card';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[CardSection,QuickAccessSection,StatsCard,FilePriviewCard],

})
export class DashboardComponent {

  files:any[]=[
    1,2,3
  ]
}
