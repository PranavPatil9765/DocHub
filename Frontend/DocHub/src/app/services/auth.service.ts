import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { loginReq, registerReq } from '../models/request';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private api = `${environment.apiBaseUrl}/auth`;

  get token() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.token;
  }

  login(data: loginReq) {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((res: any) => localStorage.setItem('token', res.token))
    );
  }

  register(data: registerReq) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  forgotPassword(email:string){
    return this.http.post(`${this.api}/send-otp`, {email});
  }
  verifyOtp(email:string,otp:string){
    return this.http.post(`${this.api}/verify-otp`, {email,otp});
  }
  resetPassword(token:string,password:string){
    return this.http.post(`${this.api}/reset-password`, {token,password});
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithGithub() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  }
}
