import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SessionDTO } from '../../models/session';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  //inyecciones
  isDarkMode: boolean = false;
  private router = inject(Router);
  currentUser: SessionDTO | null = null;


  ngOnInit() {
    const sessionData = localStorage.getItem("userSession");

    const savedTheme = localStorage.getItem("theme");
    //verifica si la compu esta en obscuro
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;


    if (sessionData) {
      this.currentUser = JSON.parse(sessionData);
    } else {
      // Si no hay session lo manda al login
      this.router.navigate(["/login"]);
    }


    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark")
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark")
    }


  }

  logout() {
    localStorage.removeItem("userSession");
    this.router.navigate(["/login"])
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

}
