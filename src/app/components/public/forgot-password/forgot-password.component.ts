import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  
  forgotForm: FormGroup;
  isLoading = false;
  isSuccess = false;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.forgotForm.value.email;

    this.userService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        // Even on error we show success to not leak emails
        this.isSuccess = true; 
      }
    });
  }
}
