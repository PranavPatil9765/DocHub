import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ScrollResponse<T> {
  items: T[];
  hasMore: boolean;
  cursorTime: string | null;
  cursorId: string | null;
}

export interface FileSearchRequest {
  query?: string;
  fileType?: string;
  favourite?: boolean;
  minSize?: number;
  maxSize?: number;
  sortBy?: 'NAME' | 'SIZE' | 'UPLOADED_AT';
  sortDir?: 'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class FileSearchService {
  private api = `${environment.apiBaseUrl}/api/files/search`;

  constructor(private http: HttpClient) {}

  searchFiles(
    req: FileSearchRequest,
    cursorTime: string | null,
    cursorId: string | null,
    limit = 20
  ): Observable<ScrollResponse<any>> {
    console.log(req,
        cursorTime,
        cursorId);

    return this.http.post<ScrollResponse<any>>(
      `${this.api}?limit=${limit}`,
      {
        ...req,
        cursorTime,
        cursorId
      }
    );
  }

  getSuggestions(query: string) {
  return this.http.get<any[]>(`${this.api}/suggestions?q=${query}`);
}

}
