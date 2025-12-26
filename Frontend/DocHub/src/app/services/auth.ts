import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private api = 'http://localhost:8080/auth'; // change to actual API

  get token() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.token;
  }

  login(data: any) {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((res: any) => localStorage.setItem('token', res.token))
    );
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
