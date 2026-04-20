import { HttpClient } from '@angular/common/http';
import { CreateComputedOptions, inject, Injectable, model } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { ModuleDTO } from '../models/module';
import { AssignModulesDTO } from '../models/update-permissions';
import { CreateRoleDTO, RoleDTO } from '../models/role';


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private http = inject(HttpClient);
  private apiURL = `${environment.endpoint}`;

  constructor() { }

  //obtener todos los roles
  getAllRoles() : Observable<ResponseAPI<RoleDTO[]>>{
    return this.http.get<ResponseAPI<RoleDTO[]>>(`${this.apiURL}Role/Get`)
  }


  //obtener todos los modulos
  getAllModules() : Observable<ResponseAPI<ModuleDTO[]>>{
    return this.http.get<ResponseAPI<ModuleDTO[]>>(`${this.apiURL}Module/Get`)
  }


  //Obtener roles por modulo
  getRolesModules(roleId : number) : Observable<ResponseAPI<number[]>>{
    return this.http.get<ResponseAPI<number[]>>(`${this.apiURL}Role/Get/${roleId}/modules`)
  }


  updateRolePermission(roleId :number , moduleIds : number[]) : Observable<ResponseAPI<boolean>>{
    const payload : AssignModulesDTO= {
      idRole : roleId,
      moduleIds : moduleIds
    };
    return this.http.post<ResponseAPI<boolean>>(`${this.apiURL}Role/UpdatePermissions`, payload);
  }

  //crear rol
  createRole(nameRol : string) :  Observable<ResponseAPI<RoleDTO>>{
    const payload : CreateRoleDTO = {
      roleName : nameRol
    };
    return this.http.post<ResponseAPI<RoleDTO>>(`${this.apiURL}Role/Create`,payload);
  }


}
