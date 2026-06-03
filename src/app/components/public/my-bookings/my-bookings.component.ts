import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { BookingDTO } from '../../../models/booking';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  private router = inject(Router);
  private bookingService = inject(BookingService);

  currentUser: any = null;
  myBookings: BookingDTO[] = [];
  isLoading = true;

  ngOnInit(): void {
    const sessionUser = localStorage.getItem('userSession');
    if (!sessionUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = JSON.parse(sessionUser);
    this.loadMyBookings();
  }

  loadMyBookings() {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res: any) => {
        const allBookings = res.value || res || [];
        // Filtrar solo las del cliente actual
        this.myBookings = allBookings.filter((b: BookingDTO) => b.idUser === this.currentUser.idUser);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error cargando reservas", err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(statusId: number): string {
    switch (statusId) {
      case 1: return 'cds-status-tag--pending';
      case 2: return 'cds-status-tag--confirmed';
      case 3: return 'cds-status-tag--cancelled';
      case 4: return 'cds-status-tag--completed';
      default: return 'cds-status-tag--pending';
    }
  }

  getStatusName(statusId: number, statusName?: string): string {
    if (statusName) return statusName;
    switch (statusId) {
      case 1: return 'Pendiente';
      case 2: return 'Confirmada';
      case 3: return 'Cancelada';
      case 4: return 'Completada';
      default: return 'Desconocido';
    }
  }
}
