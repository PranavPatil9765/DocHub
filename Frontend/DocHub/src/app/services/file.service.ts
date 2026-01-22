import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType
} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileRow, FileUpdateRequest } from '../models/file.model';

export interface UploadProgress {
  progress: number;           // 0–100
  completed: boolean;
  response?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private api = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Upload single file with metadata
   * Emits real upload progress
   */
  uploadFile(
  file: File,
  metadata: {
    name: string;
  }
): Observable<UploadProgress> {

  const ext = file.name.includes('.')
    ? file.name.substring(file.name.lastIndexOf('.'))
    : '';

  const newFileName = metadata.name.endsWith(ext)
    ? metadata.name
    : metadata.name + ext;

  // 🔥 Create a new File with the new name
  const renamedFile = new File(
    [file],
    newFileName,
    { type: file.type, lastModified: file.lastModified }
  );

  const formData = new FormData();
  formData.append('file', renamedFile);

  return this.http.post(
    `${this.api}/files/upload`,
    formData,
    {
      reportProgress: true,
      observe: 'events'
    }
  ).pipe(
    map((event: HttpEvent<any>): UploadProgress => {

      switch (event.type) {

        case HttpEventType.UploadProgress:
          return {
            progress: event.total
              ? Math.round((event.loaded / event.total) * 100)
              : 0,
            completed: false
          };

        case HttpEventType.Response:
          return {
            progress: 25,
            completed: true,

            // 🔥 BACKEND RESPONSE
            // ApiResponse<Boolean, String, UUID>
            response: {
             fileId: event.body?.data?.fileId,
             thumbnailLink: `${this.api}${event.body?.data?.thumbnailId}`,
              message: event.body?.message
              }
          };

        default:
          return {
            progress: 0,
            completed: false
          };
      }
    })
  );
}


 deleteFiles(fileIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.api}/api/files/delete`, {fileIds:fileIds});
  }

  updateFiles(files:FileUpdateRequest[]): Observable<void> {
    console.log("updating with:",{files:files});

    return this.http.post<void>(`${this.api}/api/files/update`, {files:files});
  }


DownloadFiles(files: string[]): Observable<Blob> {
  return this.http.post(
    `${this.api}/files/download`,
    { fileIds: files },
    {
      responseType: 'blob' // 🔥 REQUIRED
    }
  );
}

 AddFavourite(files:string[]): Observable<void> {
    return this.http.post<void>(`${this.api}/api/files/favourite`, {fileIds:files});
  }
DeleteFavourite(files: string[]): Observable<void> {
  return this.http.delete<void>(
    `${this.api}/api/files/favourite`,
    {
      body: { fileIds: files }   // 👈 body must be here
    }
  );
}


}
