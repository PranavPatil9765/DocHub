import { AuthService } from './../../services/auth.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../../components/spinner/spinner";

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.html',
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
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
    private router: Router,
    private authservice:AuthService
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

    this.loading = true;
    const email = sessionStorage.getItem('email') as string;
    const otp = this.form.get('otp')?.value as string;
    console.log(email,otp);

   this.authservice.verifyOtp(email,otp).pipe(finalize(()=>{this.loading = false})).subscribe({
      next: (res:any) => {
        // replace with VERIFIED token
        sessionStorage.setItem('PasswordResetToken', res.token);
        sessionStorage.removeItem('email');
        this.router.navigate(['/reset-password']);
      },
      error: err => {
        this.error = err.error?.message || 'Invalid OTP';
      }
    });
  }
}
