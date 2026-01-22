import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent {
  error = '';
  loading = false;

  showPassword = false;
  showConfirmPassword = false;

  private fb = inject(FormBuilder);
  private authservice = inject(AuthService)
  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;

    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  }

  submit() {
    if (this.form.invalid) return;

    const token = sessionStorage.getItem('PasswordResetToken');
    if (!token) {
      this.error = 'Unauthorized request';
      return;
    }
    const password = this.form.get('newPassword')?.value as string;

    this.loading = true;
    this.error = '';

   this.authservice.resetPassword(token,password).subscribe({
      next: () => {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      error: err => {
        this.error = err.error?.message || 'Reset failed';
        this.loading = false;
      }
    });
  }
}
