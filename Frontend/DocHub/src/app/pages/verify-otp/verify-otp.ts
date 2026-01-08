import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.html',
  imports:[ReactiveFormsModule,CommonModule],
  styleUrls:["./verify-otp.scss"]
})
export class VerifyOtpComponent {
  error = '';
  loading = false;
  private fb = inject(FormBuilder);

  form = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  onOtpInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '');

  input.value = value;

  const otpArray = this.form.value.otp
    ? this.form.value.otp.split('')
    : [];

  otpArray[index] = value;
  this.form.patchValue({ otp: otpArray.join('') });

  // 👉 SAFE CAST
  const next = input.nextElementSibling as HTMLInputElement | null;
  if (value && next) {
    next.focus();
  }
}

onBackspace(event: Event, index: number) {
  const input = event.target as HTMLInputElement;

  if (!input.value) {
    const prev = input.previousElementSibling as HTMLInputElement | null;
    prev?.focus();
  }
}

  submit() {
    const resetToken = sessionStorage.getItem('resetToken');
    if (!resetToken) {
      this.error = 'Session expired';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:8080/auth/verify-otp', {
      otp: this.form.value.otp,
      resetToken
    }).subscribe({
      next: (res) => {
        // replace with VERIFIED token
        sessionStorage.setItem('verifiedResetToken', res.verifiedResetToken);
        sessionStorage.removeItem('resetToken');
        this.router.navigate(['/reset-password']);
      },
      error: err => {
        this.error = err.error?.message || 'Invalid OTP';
        this.loading = false;
      }
    });
  }
}
