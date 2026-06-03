import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm: FormGroup;
  token: string | null = null;
  email: string | null = null;
  
  isLoading = false;
  isSuccess = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email');

    if (!this.token || !this.email) {
      this.errorMessage = "El enlace de recuperación es inválido o está incompleto.";
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token || !this.email) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this.userService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status) {
          this.isSuccess = true;
        } else {
          this.errorMessage = res.msg || "Ocurrió un error al restablecer la contraseña.";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.msg || "El enlace ha expirado o es inválido.";
      }
    });
  }
}
