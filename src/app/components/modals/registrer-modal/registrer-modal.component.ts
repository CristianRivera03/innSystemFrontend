import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleDTO } from '../../../models/role';
import { UserDTO, UserUpdateDTO } from '../../../models/user';

@Component({
  selector: 'app-registrer-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './registrer-modal.component.html',
})
export class RegistrerModalComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  isDarkMode: boolean = false;

  @Input() isOpen: boolean = false;
  @Input() roles: RoleDTO[] = [];
  @Input() userToEdit: UserDTO | null = null; 

  @Output() onClose = new EventEmitter<void>();
  @Output() onUserCreated = new EventEmitter<void>(); 

  signUpForm!: FormGroup;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    }
    if(!this.signUpForm) this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit'] || changes['isOpen']) {
      if(this.isOpen) {
         this.initForm();
      }
    }
  }

  initForm() {
    this.signUpForm = this.fb.group({
      idRole: [this.userToEdit?.idRole || '', [Validators.required]],
      firstName: [this.userToEdit?.firstName || '', [Validators.required]],
      lastName: [this.userToEdit?.lastName || '', [Validators.required]],
      phone: [this.userToEdit?.phone || ''],
      documentId: [this.userToEdit?.documentId || ''],
      isActive: [this.userToEdit ? this.userToEdit.isActive : true]
    });

    if (!this.userToEdit) {
      this.signUpForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
      this.signUpForm.addControl('password', this.fb.control('', [Validators.required]));
    }
  }

  closeModal() {
    this.onClose.emit();
    if(this.signUpForm) {
      this.signUpForm.reset();
    }
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      const dataForm = { ...this.signUpForm.value, idRole: Number(this.signUpForm.value.idRole) };

      if (this.userToEdit) {
        const updateData: UserUpdateDTO = {
            idRole: dataForm.idRole,
            firstName: dataForm.firstName,
            lastName: dataForm.lastName,
            phone: dataForm.phone,
            documentId: dataForm.documentId,
            isActive: dataForm.isActive
        };

        this.userService.updateUser(this.userToEdit.idUser, updateData).subscribe({
            next: (response) => {
              if (response.status === true) {
                alert("¡Usuario actualizado exitosamente!");
                this.onUserCreated.emit();
                this.closeModal();
              } else {
                alert("Error al actualizar: " + (response.msg || "Desconocido"));
              }
            },
            error: (err) => {
              console.error("error al actualizar el usuario", err);
              alert("No se pudo actualizar el usuario");
            }
        });
      } else {
        this.userService.signUp(dataForm).subscribe({
            next: (response) => {
              if (response.status === true) {
                alert("¡Cuenta creada exitosamente!");
                this.onUserCreated.emit();
                this.closeModal();
              } else {
                alert("Error al registrar: " + (response.msg || "Desconocido"));
              }
            },
            error: (err) => {
              console.error("error al crear el usuario", err);
              alert("No se pudo crear el usuario");
            }
        });
      }
    } else {
      this.signUpForm.markAllAsTouched();
    }
  }
}
