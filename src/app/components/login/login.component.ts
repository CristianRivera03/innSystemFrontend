import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {
  //se inyectan las importaciones

  isDarkMode: boolean = false;

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

  // se agregan validaciones 
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });


  //Al enviar
  onSubmit() {
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.status === true) {

            localStorage.setItem('userSession', JSON.stringify(response.value));
            this.router.navigate(['/dashboard']);
            console.log("login exitoso", response);
            //alert("Welcome");
          }

        },
        error: (err) => {
          console.error("error de autenficacion", err);
          alert("No se pudo iniciar sesion");
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
