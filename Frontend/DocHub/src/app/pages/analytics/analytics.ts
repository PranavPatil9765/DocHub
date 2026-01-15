import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';

import { PieChartComponent } from '../../components/pie-chart/pie-chart';
import { TagCloudComponent } from '../../components/tag-cloud/tag-cloud';
import { StorageUsageComponent } from '../../components/storage-usage/storage-usage';
import { DocHubLoaderComponent } from '../../components/dochub-loader/dochub-loader';

import { AnalyticsService } from '../../services/analytics.service';

/* =====================
 * TYPES
 * ===================== */

interface FileTypeAnalytics {
  file_type: string;
  file_count: number;
  storage_used: number;
}

interface AnalyticsResponse {
  by_file_type: FileTypeAnalytics[];
}

interface TagResponse {
  tag: string;
  count: number;
}

interface StorageData {
  type: string;
  sizeGB: number;
  color: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    PieChartComponent,
    TagCloudComponent,
    StorageUsageComponent,
    DocHubLoaderComponent
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit {

  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  /* =====================
   * DATA
   * ===================== */

  analyticsData!: AnalyticsResponse;
  chartData: FileTypeAnalytics[] = [];
  topTags: TagResponse[] = [];
  stats!: {total_files:number,total_collections:number};

  storageData: StorageData[] = [];

  /* =====================
   * LIFECYCLE
   * ===================== */

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  /* =====================
   * API
   * ===================== */

  fetchAnalytics() {
    this.loading = true;

    forkJoin({
      analytics: this.analyticsService.getAnalytics(),
      tags: this.analyticsService.getTopTags(),
      stats: this.analyticsService.getStats()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.analyticsData = res.analytics.data;
          this.topTags = res.tags.data;
          this.stats = res.stats.data;

          this.chartData = this.analyticsData.by_file_type;

          // ✅ IMPORTANT: build storage data
          this.buildStorageDataFromAnalytics();
        },
        error: (err) => {
          console.error('Analytics load failed', err);
        }
      });
  }

  /* =====================
   * STORAGE BAR DATA
   * ===================== */

  buildStorageDataFromAnalytics() {
    const data: StorageData[] = [];

    this.analyticsData.by_file_type.forEach(item => {
      const type = item.file_type.toUpperCase();
      const sizeGB =
        +(item.storage_used / (1024 * 1024 * 1024)).toFixed(4);

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
          type: 'Documents',
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
}
