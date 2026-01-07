import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html'
})
export class Profile {

  username = 'Pranav';
  email = 'pranav@example.com';

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
