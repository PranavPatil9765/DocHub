import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AnalyticsResponse } from "../models/Analytics";

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getAnalytics() {
    return this.http.get<AnalyticsResponse>(`${this.api}/dashboard/analytics`);
  }

  getRecentFiles() {
    return this.http.get(`${this.api}/dashboard/recent`);
  }

  getFavourites() {
    return this.http.get(`${this.api}/dashboard/favourites`);
  }
  getStorageChart() {
    return this.http.get(`${this.api}/dashboard/storage-chart`);
  }
}
