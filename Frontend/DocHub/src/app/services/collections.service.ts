import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { collection } from '../constants/constants';
import { CollectionRequest } from '../models/collectionRequest.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {

  private api = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getCollections() {
    return this.http.get<any>(`${this.api}/collections`);
  }

  getCollectionFiles(CollectionId:string) {
    return this.http.get<any>(`${this.api}/collections/${CollectionId}`);
  }

  updateCollection(id: string, payload: CollectionRequest){
    return this.http.put(`${this.api}/collections/${id}`, payload);
  }
  AddFilesInCollection(id: string,fileIds:string[]){
    const payload = {fileIds:fileIds};
    return this.http.post(`${this.api}/collections/${id}/files`, payload);
  }
  RemoveFilesInCollection(id: string,fileIds:string[]){
    const payload = {fileIds:fileIds};
    return this.http.post(`${this.api}/collections/${id}/files/remove`, payload);
  }
  createCollection(Collection:CollectionRequest) {
    return this.http.post<any>(`${this.api}/collections`,Collection);
  }
  getDefaultCollections(collectionName:string|null){

      return this.http.get<any>(`${this.api}/collections/default/${collectionName}`);

  }
}
