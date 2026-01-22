import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { CommonModule } from '@angular/common';

Chart.register(...registerables, zoomPlugin);

@Component({
  selector: 'app-storage-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-line-chart.html'
})
export class StorageLineChartComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: { date: string; storage_used: number | string }[] = [];

  private chart!: Chart<'line'>;
  private viewReady = false;

  /* ---------------- Lifecycle ---------------- */

  ngAfterViewInit() {
    this.viewReady = true;
    this.createChart();
    this.updateChart(); // handle case where data already exists
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['data'] && this.viewReady) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  /* ---------------- Chart ---------------- */

  private createChart() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Storage Used',
            data: [],
            borderColor: '#2563eb',
            backgroundColor: gradient,
            fill: true,
            tension: 0.45,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        /* ---------- ZOOM / PAN ---------- */
        plugins: {
          legend: { display: false },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x'
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: 'x'
            }
          },
          tooltip: {
            callbacks: {
              label: ctx =>
                `${(Number(ctx.raw) / (1024 * 1024)).toFixed(2)} MB`
            }
          }
        },

        /* ---------- AXES ---------- */
        scales: {
          x: {
            ticks: {
              color: '#475569'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 6,
              callback: value =>
                `${(Number(value) / (1024 * 1024)).toFixed(2)} MB`
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart || !this.data?.length) return;

    this.chart.data.labels = this.data.map(d => d.date);

    // ✅ FORCE numeric values (bytes)
    this.chart.data.datasets[0].data =
      this.data.map(d => Number(d.storage_used));

    this.chart.update('active');
  }
}
