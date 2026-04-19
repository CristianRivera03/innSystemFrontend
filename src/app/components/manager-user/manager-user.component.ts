import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionDTO } from '../../models/session';
import { UserService } from '../../services/user.service';
import { UserDTO } from '../../models/user';
import { RegistrerModalComponent } from '../modals/registrer-modal/registrer-modal.component';
import { RoleDTO } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { errorContext } from 'rxjs/internal/util/errorContext';



@Component({
  selector: 'app-manager-user',
  standalone: true,
  imports: [RegistrerModalComponent, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './manager-user.component.html',
})


//Clase
export class ManagerUserComponent {
  //usuario actual
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService)
  isRegisterModalOpen: boolean = false;

  currentUser: SessionDTO | null = null;
  users: UserDTO[] = [];
  roles: RoleDTO[] = [];


  ngOnInit() {
    this.loadUserSession();
    if (this.currentUser) {
      this.loadUsers(); // solo mostrara los posts si hay alguien logeado
      this.loadRoles();
    }
  }

  //Cargar session 
  loadUserSession() {
    const sessionData = localStorage.getItem("userSession");
    if (sessionData) {
      this.currentUser = JSON.parse(sessionData);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  //cargar usuarios
  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.value || res;

        console.log("Log de users", this.users);

      },
      error: (err) => {
        console.error("Error al cargar la lista de usuarios", err);

      }
    })
  }

  loadRoles(){
    this.roleService.getAllRoles().subscribe({
      next :(res : any) =>{
        this.roles = res.value || res;
        console.log("Roles cargados" , this.roles);
        
      },
      error: (err) =>{
        console.error("Error al cargar la lista")
      }
    })
  }

  onChangeUserRole(userId: string, event: any) {
    const newRoleId = Number(event.target.value);
    if (confirm("Estas seguro de modificar este usuario?")) {
      this.userService.changeUserRole(userId, newRoleId).subscribe({
        next: (res) => {
          if (res.status) {
            console.log("rol actualizado");

          } else {
            alert("Error " + res.msg)
          }
        }, error: (err) => console.error("Error actualizado rol del usuario", err)
      })
    }
  }

  //Inactivar user
  inactiveUser(idUser: string) {
    const confirmation = confirm("Estas seguro de eliminar este usuario?")
    if (confirmation) {
      this.userService.eraseUser(idUser).subscribe({
        next: (response) => {
          console.log("usuario eliminada", response);
          this.loadUsers()
        },
        error: (err) => {
          console.error("Error al eliminar", err);
          alert("No tienes los permisos para borrar esta usuarios")
        }
      })
    }
  }

  //Función para abrir
  openRegisterModal() {
    this.isRegisterModalOpen = true;
  }

  //Función para cerrar
  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }




}
