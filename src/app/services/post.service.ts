import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PostCreateDTO , PostDTO} from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  //se inyectan las importaciones
  private http = inject(HttpClient);
  //URL
  private apiURL = `${environment.endpoint}Post`;

  constructor() {}

  //Traer todas las publicaciones
  getAllPosts() :  Observable<any>{
    return this.http.get<any>(`${this.apiURL}/Get`)
  }

  //Metodo para crear post
  createPost(post : PostCreateDTO) : Observable<any>{
    return this.http.post(`${this.apiURL}/Create` ,post);
  }

  //Borrar Post
  deletePost(idPost : string) : Observable<any>{
    return this.http.delete(`${this.apiURL}/Delete/${idPost}`)
  }
}
