import { Component } from '@angular/core';
import { PieChartComponent } from '../../components/pie-chart/pie-chart';
import { TagCloudComponent } from "../../components/tag-cloud/tag-cloud";

@Component({
  selector: 'app-analytics',
  imports: [PieChartComponent, TagCloudComponent],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
topTags = [
  { label: 'Invoices', count: 120 },
  { label: 'Contracts', count: 95 },
  { label: 'Reports', count: 80 },
  { label: 'Resumes', count: 70 },
  { label: 'Tax', count: 65 },
  { label: 'Design', count: 55 },
  { label: 'HR', count: 45 },
  { label: 'Marketing', count: 40 },
  { label: 'Legal', count: 35 },
  { label: 'Finance', count: 30 }
];

}
