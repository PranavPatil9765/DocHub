import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.html',
  styleUrls: ['./pie-chart.scss'],
  imports: [CommonModule]
})
export class PieChartComponent
  implements AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('pieCanvas', { static: true })
  pieCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() chartData: {
    file_type: string;
    file_count: number;
    storage_used: number;
  }[] = [];

  chart!: Chart;
  highlightIndex = 0;
  intervalId?: number;

  readonly colors = [
    '#2563eb',
    '#3b82f6',
    '#60a5fa',
    '#1e40af',
    '#93c5fd'
  ];

  /* ======================
   * LIFECYCLE
   * ====================== */

  ngAfterViewInit() {
    if (this.chartData.length > 0) {
      this.createChart();
      this.startAutoLoop();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['chartData'] || !this.chartData.length) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.createChart();
    this.startAutoLoop();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.chart) {
      this.chart.destroy();
    }
  }

  /* ======================
   * CHART LOGIC
   * ====================== */

  createChart() {
    this.chart = new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.chartData.map(d => d.file_type),
        datasets: [
          {
            data: this.chartData.map(d => d.file_count),
            backgroundColor: this.colors,
            hoverOffset: 22,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            cornerRadius: 10,
            titleColor: '#fff',
            bodyColor: '#e5e7eb',
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.raw} files`
            }
          }
        }
      }
    });
  }

  startAutoLoop() {
    if (!this.chartData.length) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.highlightIndex = 0;

    this.intervalId = window.setInterval(() => {
      this.chart.setActiveElements([
        { datasetIndex: 0, index: this.highlightIndex }
      ]);
      this.chart.update();

      this.highlightIndex =
        (this.highlightIndex + 1) % this.chartData.length;
    }, 1800);
  }

  highlight(index: number) {
    if (!this.chart) return;

    this.chart.setActiveElements([
      { datasetIndex: 0, index }
    ]);
    this.chart.update();
  }

  clearHighlight() {
    if (!this.chart) return;

    this.chart.setActiveElements([]);
    this.chart.update();
  }

  /* ======================
   * DERIVED DATA
   * ====================== */

  get totalFiles(): number {
    return this.chartData.reduce(
      (sum, item) => sum + item.file_count,
      0
    );
  }
}
