import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { loginReq } from '../../models/request';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../../components/spinner/spinner";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, SpinnerComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  error = '';
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

 submit() {
  if (this.form.invalid) return;

  this.loading = true;

  this.authService.login(this.form.value as loginReq)
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: () => {
        this.toast.success('Login successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toast.show(err?.error.message);
      }
    });
}
  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithGithub() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  }
}
