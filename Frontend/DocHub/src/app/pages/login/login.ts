import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { loginReq } from '../../models/request';
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, SpinnerComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  api = environment.apiBaseUrl;
  authService = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  error = '';
  loading = false;
  route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
ngOnInit() {
  this.route.queryParams.subscribe(params => {
    if (params['verified'] === 'true') {
      this.toast.success('Account verified! Please login.');
    }

    if (params['verified'] === 'false') {
      this.toast.error('Verification link expired or invalid.');
    }
  });
}

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
    window.location.href = `${this.api}/oauth2/authorization/google`;
  }

  loginWithGithub() {
    window.location.href = `${this.api}/oauth2/authorization/github`;
  }
}
