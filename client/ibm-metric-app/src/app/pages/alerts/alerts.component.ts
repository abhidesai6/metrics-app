import { Component, OnInit } from '@angular/core';
import { METRICS } from '../../constants/metrics.constant';
import { AlertService } from '../../services/alert.service';
import { interval, Subscription } from 'rxjs';

interface Alert {
  id?: string;
  metric: string;
  threshold: number;
  operator: string;
}

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  metrics = METRICS;
  alerts: Alert[] = [];
  newAlert: Alert = { metric: '', threshold: 0, operator: '>' };
  editId: string | null = null;
  activeAlerts: any[] = [];
  alertSubscription!: Subscription;
  operatorOption = [
    { value: '>', label: 'Greater Than (>)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '>=', label: 'Greater Than or Equal (>=)' },
    { value: '<=', label: 'Less Than or Equal (<=)' },
    { value: '==', label: 'Equal (==)' },
  ];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.loadThresholds();
    this.loadAlerts(); 

    this.alertSubscription = interval(10000).subscribe(() => {
      this.loadAlerts();
    });
  }

  loadAlerts() {
    this.alertService.getActiveAlerts().subscribe({
      next: (alerts) => {
        this.activeAlerts = alerts;
      },
      error: (err) => console.error('Failed to fetch alerts', err)
    });
  }

  loadThresholds(): void {
    this.alertService.getThresholds().subscribe({
      next: (data) => this.alerts = data,
      error: (err) => console.error('Failed to load alerts', err)
    });
  }
  
  addOrUpdateAlert(): void {
    if (this.editId) {
      this.alertService.updateThreshold(this.editId, this.newAlert).subscribe({
        next: () => {
          this.loadThresholds();
          this.resetForm();
        },
        error: (err) => console.error('Update failed', err)
      });
    } else {
      this.alertService.addThreshold(this.newAlert).subscribe({
        next: () => {
          this.loadThresholds();
          this.resetForm();
        },
        error: (err) => console.error('Create failed', err)
      });
    }
  }

  editAlert(alert: Alert): void {
    this.newAlert = { ...alert };
    this.editId = alert.id || null;
  }

  deleteAlert(alert: Alert): void {
    if (alert.id) {
      this.alertService.deleteThreshold(alert.id).subscribe({
        next: () => this.loadThresholds(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  resetForm(): void {
    this.newAlert = { metric: '', threshold: 0, operator: '>' };
    this.editId = null;
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe(); 
  }
}
