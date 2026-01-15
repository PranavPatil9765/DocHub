import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  imports:[CommonModule,FormsModule,ReactiveFormsModule],
  styleUrls:["./forgot-password.scss"]
})
export class ForgotPasswordComponent {
  error = '';
  loading = false;
    private fb = inject(FormBuilder);
    public auth = inject(AuthService)
    constructor(
      private http: HttpClient,
      private router: Router
    ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    this.http.post<any>('http://localhost:8080/auth/forgot-password', this.form.value)
      .subscribe({
        next: (res) => {
          // resetToken saved only temporarily (not verified yet)
          sessionStorage.setItem('resetToken', res.resetToken);
          this.router.navigate(['/verify-otp']);
        },
        error: err => {
          this.error = err.error?.message || 'Failed to send OTP';
          this.loading = false;
        }
      });
  }
}
