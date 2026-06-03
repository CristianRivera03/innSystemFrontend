import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit {
  //se inyectan las importaciones

  isDarkMode: boolean = false;
  showPassword = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem("theme");
    //verifica si la compu esta en obscuro
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark")
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark")
    }
  }

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage: string = '';

  //Al enviar
  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.userService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.status === true) {

            localStorage.setItem('userSession', JSON.stringify(response.value));
            
            const roleName = response.value.roleName?.toLowerCase() || '';
            if (roleName === 'client' || roleName === 'cliente') {
              this.router.navigate(['/my-bookings']);
            } else {
              this.router.navigate(['/dashboard']);
            }
            
            console.log("login exitoso", response);
          }

        },
        error: (err) => {
          console.error("error de autenticacion", err);
          if (err.status === 401) {
             this.errorMessage = err.error?.msg || "Correo o contraseña incorrectos.";
          } else {
             this.errorMessage = "Ocurrió un error en el servidor. Intenta más tarde.";
          }
        }
      })
    }
  }


  //cambiar el theme
  toggleTheme() : void{
    // cambia el estado por el inverso
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  goSignUp(){
    this.router.navigate(['/signup']); 
  }
}
