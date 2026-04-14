import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
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


  signUpForm: FormGroup = this.fb.group({
    userName :['', [Validators.required]],
    nameUser :['', [Validators.required]],
    lastNameUser :['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });


  onSubmit() {
    if (this.signUpForm.valid) {
      //se recepta el formulario
      const dataForm = this.signUpForm.value
    
    this.userService.signUp(this.signUpForm.value).subscribe({
        next: (response) => {
          if (response.status === true) {
            alert("¡Cuenta creada! exitosamente");
            this.router.navigate(['/login']);
            //alert("Welcome");
          }else{
            alert("Error al registrar");
            console.error("error" ,response.status);
            
          }

        },
        error: (err) => {
          console.error("error de al crear el usuario", err);
          alert("No se pudo crear el usuario");
        }
      })
    }else{
      this.signUpForm.markAllAsTouched();
    }
  }


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

  goLogin(){
    this.router.navigate(['/login']);
  }


}
