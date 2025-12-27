import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy
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
  imports:[CommonModule]
})
export class PieChartComponent implements AfterViewInit, OnDestroy {

  @ViewChild('pieCanvas', { static: true })
  pieCanvas!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;
  highlightIndex = 0;
  intervalId!: number;

  data = [
    { type: 'PDF', size: 420 },
    { type: 'Images', size: 310 },
    { type: 'Docs', size: 180 },
    { type: 'Videos', size: 720 },
    { type: 'Archives', size: 90 }
  ];

  colors = [
    '#2563eb',
    '#3b82f6',
    '#60a5fa',
    '#1e40af',
    '#93c5fd'
  ];

  ngAfterViewInit() {
    this.createChart();
    this.startAutoLoop();
  }

  createChart() {
    this.chart = new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.data.map(d => d.type),
        datasets: [
          {
            data: this.data.map(d => d.size),
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
              label: ctx => `${ctx.label}: ${ctx.raw} MB`
            }
          }
        }
      }
    });
  }

  startAutoLoop() {
    this.intervalId = window.setInterval(() => {
      this.chart.setActiveElements([
        { datasetIndex: 0, index: this.highlightIndex }
      ]);
      this.chart.update();

      this.highlightIndex =
        (this.highlightIndex + 1) % this.data.length;
    }, 1800);
  }

  highlight(index: number) {
    this.chart.setActiveElements([
      { datasetIndex: 0, index }
    ]);
    this.chart.update();
  }

  clearHighlight() {
    this.chart.setActiveElements([]);
    this.chart.update();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.chart.destroy();
  }

  get totalSize(): number {
    return this.data.reduce((a, b) => a + b.size, 0);
  }
}
