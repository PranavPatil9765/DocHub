// Root API response
export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: AnalyticsData;
}

// Main analytics data
export interface AnalyticsData {
  total_storage: number;          // bytes
  by_file_type: FileTypeAnalytics[];
}

// Per file-type breakdown
export interface FileTypeAnalytics {
  file_type: string;              // e.g. DOCUMENT, IMAGE, pdf
  file_count: number;
  storage_used: number;           // bytes
}

export interface StatCard {
  title: string;
  count: number;
  bg:string;
}
