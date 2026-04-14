import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTO } from '../models/login';
import { environment } from '../../environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.endpoint}User/Login`;

  constructor() { }


  login(credentials : LoginDTO) : Observable<any>{
    return this.http.post(this.apiUrl , credentials)
  }
}
