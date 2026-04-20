import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { RoleDTO } from '../../models/role';
import { ModuleDTO } from '../../models/module';
import { errorContext } from 'rxjs/internal/util/errorContext';


@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.component.html',
})
export class RoleManagementComponent implements OnInit {

  private roleService = inject(RoleService);

  //variables a mostrar para llenar pantalla
  roles: RoleDTO[] = [];
  modules: ModuleDTO[] = [];

  //variables de estado
  selectedRoleId: number = 0;
  selectedModuleIds: number[] = [];
  newRoleName : string = "";

  ngOnInit(): void {
    this.loadInitialData();
  }

  createNewRole(){
    if(!this.newRoleName.trim()){
      alert("El nombre de rol no puede estar vacio");
      return;
    }

    this.roleService.createRole(this.newRoleName).subscribe({
      next : (res) =>{
        if (res.status){
          alert("Rol creado exitosamente, ahora puedes asignarle permisos");
          this.roles.push(res.value);
          this.selectedRoleId = res.value.idRole;
          this.selectedModuleIds = [];
          this.newRoleName = "";
        }else{
          alert("Error: " + res.msg);
        }
      },
      error : (err) => console.error("Error creando rol", err)
    })
  }

  loadInitialData() {

    //Obtener roles
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        if(res.status){
          this.roles = res.value
        }
      },
      error :(err) => console.error("Error cargando los roles" , err)
    });

    this.roleService.getAllModules().subscribe({
      next: (res) => {
        if (res.status) {
          this.modules = res.value;
        }
      },
      error: (err) => console.error("Error cargando modulos", err)
    });
  }

  //ver ver los permisos que tiene un Rol
  onRoleChange(event : any){
    this.selectedRoleId = Number(event.target.value);

    if(this.selectedRoleId === 0){
      this.selectedModuleIds = [];
      return;
    }

    this.roleService.getRolesModules(this.selectedRoleId).subscribe({
      next : (res) =>{
        if(res.status){
          this.selectedModuleIds = res.value;
        }
      },
      error : (err) =>{
        console.error("Error al cargar permisos" , err);
        this.selectedModuleIds = [];
      }
    })
  }

  toggleModule(moduleId : number){

    const index = this.selectedModuleIds.indexOf(moduleId);

    if(index > -1){
      this.selectedModuleIds.splice(index , 1);
    }else{
      this.selectedModuleIds.push(moduleId);
    }
  }

  savePermissions(){
    if(this.selectedRoleId === 0){
      alert("Por favor selecciona un rol primero");
      return;
    }


    this.roleService.updateRolePermission(this.selectedRoleId , this.selectedModuleIds).subscribe({
      next : (res) =>{
        if(res.status){
          alert("Permisos actualizados con exito");
        }else{
          alert("Error: " + res.msg)
        }
      },
      error : (err) =>{
        console.error("Error guardando " , err)
        alert("Ocurrio un error en el servidor")
      }
    });
  }
}
