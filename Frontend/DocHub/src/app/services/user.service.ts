import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AnalyticsResponse } from "../models/Analytics";
import { UserResponse } from "../models/UserResponse";

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  getUser() {
    return this.http.get<UserResponse>(`${this.api}/dashboard/user`);
  }
  changePassword(oldPassword:string,newPassword:string){
    const payload = {oldPassword,newPassword};
        return this.http.post<UserResponse>(`${this.api}/user/change-password`,payload);
  }
}
