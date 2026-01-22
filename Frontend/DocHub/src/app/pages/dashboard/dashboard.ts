import { AnalyticsResponse, StatCard } from './../../models/Analytics';
import { DashboardService } from './../../services/dashboardService';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ElaticSearchBar } from '../../components/elatic-search-bar/elatic-search-bar';
import { CardSection } from '../../components/card-section/card-section';
import { QuickAccessSection } from '../../components/quick-access-section/quick-access-section';
import { StatsCard } from '../../components/stats-card/stats-card';
import { FilePriviewCard } from '../../components/file-priview-card/file-priview-card';
import { dummyFiles } from '../../constants/constants';
import { FileRow } from '../../models/file.model';
import { StorageUsageComponent } from '../../components/storage-usage/storage-usage';
import { DocHubLoaderComponent } from '../../components/dochub-loader/dochub-loader';
import { finalize, forkJoin } from 'rxjs';
import { AnalyticsData } from '../../models/Analytics';
import { StorageLineChartComponent } from "../../components/storage-line-chart/storage-line-chart";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    CardSection,
    QuickAccessSection,
    StatsCard,
    StorageUsageComponent,
    DocHubLoaderComponent,
    StorageLineChartComponent
],
})
export class DashboardComponent {
  totalStorageGB = 20;
  loading = false;
  dashboardService = inject(DashboardService);
  stats: any;
  recentFiles: any;
  favouritesFiles: any;
  activity: any;
  analytics!: AnalyticsData;
  storagechart:any
  statCards: StatCard[] = [];
  storageData:any[] = [];
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.loading = true;

    forkJoin({
      analytics: this.dashboardService.getAnalytics(),
      recentFiles: this.dashboardService.getRecentFiles(),
      favourites: this.dashboardService.getFavourites(),
      storagechart: this.dashboardService.getStorageChart(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // 🔥 FORCE UI UPDATE
        })
      )
      .subscribe({
        next: (res: any) => {

          this.analytics = res.analytics.data;
          this.recentFiles = res.recentFiles.data;
          this.favouritesFiles = res.favourites.data;
          this.storagechart = res.storagechart.data;
          this.buildStatCardsFromAnalytics();
          this.buildStorageDataFromAnalytics();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  buildStatCardsFromAnalytics() {
    const cards: StatCard[] = [];

    this.analytics.by_file_type.forEach((item) => {
      const type = item.file_type.toUpperCase();

      if (type === 'IMAGE') {
        cards.push({ title: 'Images', count: item.file_count, bg: 'bg-blue-100' });
      } else if (type === 'DOCUMENT') {
        cards.push({ title: 'Documents', count: item.file_count, bg: 'bg-red-100' });
      } else if (type === 'PDF') {
        cards.push({ title: 'PDF', count: item.file_count, bg: 'bg-green-100' });
      } else if ((type === 'OTHER')) {
        cards.push({ title: 'Other', count: item.file_count, bg: 'white' });
      }
    });

    this.statCards = cards;
  }

  buildStorageDataFromAnalytics() {
  const data: {
    type: string;
    sizeGB: number;
    color: string;
  }[] = [];

  this.analytics.by_file_type.forEach(item => {
    const type = item.file_type.toUpperCase();
    const sizeGB = +(item.storage_used / (1024 * 1024 * 1024)).toFixed(4);

    if (type === 'PDF') {
      data.push({
        type: 'PDF Documents',
        sizeGB,
        color: 'bg-blue-600'
      });
    }
    else if (type === 'IMAGE') {
      data.push({
        type: 'Images',
        sizeGB,
        color: 'bg-blue-400'
      });
    }
    else if (type === 'DOCUMENT') {
      data.push({
        type: 'DOCUMENT',
        sizeGB,
        color: 'bg-blue-300'
      });
    }
    else {
      data.push({
        type: 'Other',
        sizeGB,
        color: 'bg-blue-500'
      });
    }
  });

  this.storageData = data;

}

  files: FileRow[] = dummyFiles;
  getColorForType(type: string): string {
    switch (type) {
      case 'PDF Documents':
        return 'bg-blue-600';
      case 'Images':
        return 'bg-blue-400';
      case 'Word Files':
        return 'bg-blue-300';
      case 'Videos':
        return 'bg-blue-500';
      default:
        return 'bg-blue-200';
    }
  }
}
