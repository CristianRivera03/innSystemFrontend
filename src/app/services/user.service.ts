import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ChangeUserRoleDTO, UserCreateDTO, UserDTO } from '../models/user';
import { ResponseAPI } from '../models/response-api';
import { LoginDTO } from '../models/login';
import { UserUpdateDTO } from '../models/user';


@Injectable({
  providedIn: 'root'
})


export class UserService {
  //Importaciones
  private http = inject(HttpClient);

  //Url
  private apiURL = `${environment.endpoint}User`


  constructor() { }

  login(credentials : LoginDTO) : Observable<any>{
      return this.http.post(`${this.apiURL}/login` , credentials)
    }


  //Obtener users
  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiURL}`)
  }

  //Regfistro pide un UserCreate y devuelve un user normal porque si devuelve un create 
  // traerla contraseña en plaintext
  signUp(userData: UserCreateDTO): Observable<ResponseAPI<UserDTO>> {
    return this.http.post<ResponseAPI<UserDTO>>(`${this.apiURL}/Create`, userData);
  }

  //Borrar registro
  eraseUser(idUser: string): Observable<any> {
    return this.http.delete(`${this.apiURL}/Delete/${idUser}`);
  }

  //Inactivar user
  inactiveUser(idUser : string) : Observable<any>{
    return this.http.delete(`${this.apiURL}/Delete/${idUser}`)
  }

  //Cambiar rol
  changeUserRole(idUser : string , idRole : number) : Observable<ResponseAPI<boolean>>{
    const payload : ChangeUserRoleDTO = {
      idUser : idUser,
      idRole : idRole
    };
    return this.http.put<ResponseAPI<boolean>>(`${this.apiURL}/ChangeRole`,payload);
  }

  //Actualizar user
  updateUser(idUser: string, userData: UserUpdateDTO): Observable<ResponseAPI<boolean>> {
    return this.http.put<ResponseAPI<boolean>>(`${this.apiURL}/Update/${idUser}`, userData);
  }

}
