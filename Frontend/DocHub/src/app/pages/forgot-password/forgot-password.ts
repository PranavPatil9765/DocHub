import { Toast } from './../../models/toast.model';
import { AuthService } from './../../services/auth.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../../components/spinner/spinner";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent],
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
  authservice = inject(AuthService)
  toast = inject(ToastService)
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';
    const email  = this.form.get('email')?.value as string;
      this.authservice.forgotPassword(email).pipe(finalize(()=>{this.loading=false}))
      .subscribe({
        next: (res:any) => {
          console.log("response is",res);

          sessionStorage.setItem('email', email);
          this.router.navigate(['/verify-otp']);
        },
        error: err => {
          this.error = err.error?.message || 'Failed to send OTP';
        }
      });
  }
}
