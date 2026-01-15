import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { DocHubLoaderComponent } from "../../components/dochub-loader/dochub-loader";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DocHubLoaderComponent],
  templateUrl: './profile.html'
})
export class Profile {

  username = '';
  email = '';
  loading = false;
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef)
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
        console.log(user);

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

    console.log('Updating password:', oldPassword, newPassword);

    this.passwordForm.reset();
  }
}
