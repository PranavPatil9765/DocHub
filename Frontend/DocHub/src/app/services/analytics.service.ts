import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private api = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  getAnalytics() {
    return this.http.get<any>(`${this.api}/api/dashboard/analytics`);
  }

  getTopTags() {
    return this.http.get<any>(`${this.api}/api/dashboard/top-tags`);
  }
  getStats() {
    return this.http.get<any>(`${this.api}/api/dashboard/stats`);
  }

}
