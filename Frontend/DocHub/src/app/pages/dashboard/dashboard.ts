import { Component } from '@angular/core';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { CardSection } from '../../components/card-section/card-section';
import { QuickAccessSection } from '../../components/quick-access-section/quick-access-section';
import { StatsCard } from '../../components/stats-card/stats-card';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { dummyFiles } from '../../constants/constants';
import { FileRow } from '../../models/file-row';
import { StorageUsageComponent } from "../../components/storage-usage/storage-usage";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CardSection, QuickAccessSection, StatsCard, StorageUsageComponent],

})
export class DashboardComponent {
  totalStorageGB = 100;

  storageData= [
    { type: 'PDF Documents', sizeGB: 32, color: 'bg-blue-600' },
    { type: 'Images', sizeGB: 18, color: 'bg-blue-400' },
    { type: 'Word Files', sizeGB: 12, color: 'bg-blue-300' },
    { type: 'Videos', sizeGB: 8, color: 'bg-blue-500' }
  ];
  files:FileRow[]=dummyFiles
  getColorForType(type: string): string {
  switch (type) {
    case 'PDF Documents': return 'bg-blue-600';
    case 'Images': return 'bg-blue-400';
    case 'Word Files': return 'bg-blue-300';
    case 'Videos': return 'bg-blue-500';
    default: return 'bg-blue-200';
  }
}
}
