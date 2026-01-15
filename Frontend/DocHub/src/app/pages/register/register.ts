import { AuthService } from '../../services/auth.service';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SpinnerComponent } from "../../components/spinner/spinner";
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ToastService } from '../../services/toastService';
import { registerReq } from '../../models/request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent,CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  loading = false;

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.register(this.form.value as registerReq )
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (res) => {
        this.toast.show('User Registered successfully', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.show( err.error.message ||'Registration Failed', 'error');
      }
    });
}
  }
