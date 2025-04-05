import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api/metrics';

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getMetricByNam(metricName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${metricName}`);
  }
}
