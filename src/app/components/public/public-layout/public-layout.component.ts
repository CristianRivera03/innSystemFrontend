import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  currentYear = new Date().getFullYear();
  private router = inject(Router);

  ngOnInit(): void {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      this.isLoggedIn = true;
      const user = JSON.parse(userSession);
      // Check if user is an admin or employee (has access to dashboard)
      // Usually role 1 is Admin, 2 is Employee, 3 is Client
      if (user.idRole === 1 || user.idRole === 2) {
        this.isAdmin = true;
      }
    }
  }

  logout() {
    localStorage.removeItem('userSession');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/home']);
  }
}
