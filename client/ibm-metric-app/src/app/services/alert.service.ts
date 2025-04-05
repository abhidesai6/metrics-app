import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private API_BASE = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getThresholds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/thresholds`);
  }

  // POST /api/thresholds - add new threshold
  addThreshold(threshold: {
    metric: string;
    threshold: number;
    operator: string;
  }): Observable<any> {
    return this.http.post(`${this.API_BASE}/thresholds`, threshold);
  }

  // PUT /api/thresholds/:id - update threshold
  updateThreshold(id: string, updated: {
    metric?: string;
    threshold?: number;
    operator?: string;
  }): Observable<any> {
    return this.http.put(`${this.API_BASE}/thresholds/${id}`, updated);
  }

  // DELETE /api/thresholds/:id - delete a threshold
  deleteThreshold(id: string): Observable<any> {
    return this.http.delete(`${this.API_BASE}/thresholds/${id}`);
  }

  getActiveAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/alerts`);
  }
}
