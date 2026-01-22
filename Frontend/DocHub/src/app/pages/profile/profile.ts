import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { DocHubLoaderComponent } from "../../components/dochub-loader/dochub-loader";
import { ToastService } from '../../services/toastService';
import { finalize } from 'rxjs';
import { SpinnerComponent } from "../../components/spinner/spinner";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DocHubLoaderComponent, SpinnerComponent],
  templateUrl: './profile.html'
})
export class Profile {

  username = '';
  email = '';
  loading = false;
  isLoading = false;
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef)
    private toast = inject(ToastService)
  passwordForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

    ngOnInit() {
    this.loadUser();
  }

  private loadUser() {
    this.loading = true;
    this.userService.getUser().subscribe({
      next: (user) => {

        this.username = user.data.user_name; // or user.name / user.fullName
        this.email = user.data.email; // or user.name / user.fullName
        this.loading=false;
        this.cdr.detectChanges()
      },
      error: () => {
        console.log("error");

        this.username = '';

        this.loading = false;
        this.cdr.detectChanges()
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    const { oldPassword, newPassword } = this.passwordForm.value;
    this.isLoading = true;
    this.userService.changePassword(oldPassword,newPassword).pipe(finalize(()=>{
      this.isLoading = false;
    })).subscribe({
      next:(res)=>{
        this.toast.success(res?.message);
      },
        error:(err)=>{
          this.toast.error(err?.error?.message || "invalid credentials")
        }
    })
    this.passwordForm.reset();
  }
}
