import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { PostCreateDTO, PostDTO } from '../../models/post';
import { CommonModule } from '@angular/common';
import { SessionDTO } from '../../models/session';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
})

export class DashboardComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private postService = inject(PostService);

  //usuario actual
  currentUser: SessionDTO | null = null;
  posts: PostDTO[] = [];

  //Formulario
  postForm: FormGroup = this.fb.group({
    titlePost: ['', [Validators.required, Validators.maxLength(100)]],
    contentPost: ['', [Validators.required, Validators.maxLength(500)]],
    idCategory: [6, [Validators.required]]
  });

  ngOnInit() {
    this.loadUserSession();
    if (this.currentUser){
      this.loadPosts(); // solo mostrara los posts si hay alguien logeado
    }
  }

  loadUserSession() {
    const sessionData = localStorage.getItem("userSession");
    if (sessionData) {
      this.currentUser = JSON.parse(sessionData);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next:  (res) => {
        console.log("imprimiendo res" ,res.value)
        this.posts = res.value;
      },
      error : (err) =>{
        console.error("Error al cargar los post ", err)
      }
    });
  }


  createPost(){
    if(this.postForm.valid && this.currentUser){ //si el post es valido que haga todo esto
      //armar formato json para la api
      const newPost : PostCreateDTO ={
        idUser : this.currentUser.idUser,
        idCategory : this.postForm.value.idCategory,
        titlePost : this.postForm.value.titlePost,
        contentPost : this.postForm.value.contentPost
      };

      this.postService.createPost(newPost).subscribe({
        next : (response) =>{
          console.log("Publicacion exitosa", response);
          
          this.postForm.reset({idCategory : 6}); //limpiando el formularioo
          this.loadPosts();
        },
        error: (err) =>{
          console.error("Error al publicar" , err);
          alert("Hubo un problema al crear la publicacion")
        }
      });
    }
  }


  deletePost(idPost : string){
    const confirmation = confirm("Estas seguro de eliminar esta publicacion?")
    if(confirmation){
      this.postService.deletePost(idPost).subscribe({
        next : (response) =>{
          console.log("Publicacion eliminada", response);
          this.loadPosts()
        },
        error : (err) =>{
          console.error("Error al eliminar", err);
          alert("No tienes los permisos para borrar esta publicacion")
        }
      })
    }
  }

  logout(){
    localStorage.removeItem("userSession");
    this.router.navigate(["/login"]);
  }
}
