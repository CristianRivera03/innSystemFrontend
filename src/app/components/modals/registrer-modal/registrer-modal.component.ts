import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-registrer-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './registrer-modal.component.html',
  styleUrl: './registrer-modal.component.scss'
})
export class RegistrerModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  isDarkMode: boolean = false;

  // recibe estado del componente padre
  @Input() isOpen: boolean = false;

  // emite evento hacia el padre 
  @Output() onClose = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit(); // dispara el evento
  }


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
    userName: ['', [Validators.required]],
    nameUser: ['', [Validators.required]],
    lastNameUser: ['', [Validators.required]],
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
            this.closeModal()

          }else{
            alert("Error al registrar");
            console.error("error" ,response.status);
            this.closeModal()
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


}
