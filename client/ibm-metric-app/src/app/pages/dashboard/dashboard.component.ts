import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../../services/api.service';
import { METRICS } from '../../constants/metrics.constant';

interface MetricData {
  value: number;
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  metrics = METRICS
  metricsData: { [key: string]: MetricData } = {};
  loading = true;
  metricColors: { [key: string]: string } = {
    cpu_usage: 'rgba(255, 99, 132, 1)',       // Red
    memory_usage: 'rgba(54, 162, 235, 1)',    // Blue
    disk_usage: 'rgba(255, 206, 86, 1)',      // Yellow
    disk_read_bytes: 'rgba(75, 192, 192, 1)', // Teal
    disk_write_bytes: 'rgba(153, 102, 255, 1)', // Purple
    network_rx_bytes: 'rgba(255, 159, 64, 1)', // Orange
    network_tx_bytes: 'rgba(100, 255, 100, 1)', // Green
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    METRICS.forEach((metric) => this.loadMetric(metric));
    this.fetchMetrics();
    console.log(this.metricsData);
    setInterval(() => this.fetchMetrics(), 30000); 
  }

  fetchMetrics() {
    this.loading = true;
    this.apiService.getMetrics().subscribe({
      next: (data) => {
        this.metricsData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching metrics:', err);
        this.loading = false;
      }
    });
  }

  loadMetric(metricName: string): void {
    this.apiService.getMetricByNam(metricName).subscribe((data) => {
      const timestamps =
        data.data.result[0]?.values.map((v: any) =>
          new Date(v[0] * 1000).toLocaleTimeString()
        ) || [];
      const values =
        data.data.result[0]?.values.map((v: any) => parseFloat(v[1])) || [];

      this.renderChart(metricName, timestamps, values);
    });
  }

  renderChart(metric: string, labels: string[], data: number[]): void {
    const canvasId = `${metric}-chart`;
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: metric,
            data,
            borderColor: this.metricColors[metric],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Time' },
          },
          y: {
            title: { display: true, text: 'Value' },
          },
        },
      },
    });
  }

}
