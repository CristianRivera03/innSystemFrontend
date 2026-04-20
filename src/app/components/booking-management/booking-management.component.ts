import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { BookingDTO } from '../../models/booking';
import { BookingManagementModalComponent } from '../modals/booking-management-modal/booking-management-modal.component'; 

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, BookingManagementModalComponent],
  templateUrl: './booking-management.component.html'
})
export class BookingManagementComponent implements OnInit {

  private bookingService = inject(BookingService);

  bookings: BookingDTO[] = [];
  isLoading: boolean = true;
  
  // Variables para el Modal
  isModalOpen: boolean = false;
  selectedBooking: BookingDTO | null = null;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        if (res.status) {
          this.bookings = res.value;
        } else {
          console.error('Error del servidor:', res.msg);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error de red cargando reservas', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.selectedBooking = null;
    this.isModalOpen = true;
  }

  openUpdateModal(booking: BookingDTO) {
    this.selectedBooking = booking;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedBooking = null;
  }

  onModalSuccess() {
    this.loadBookings();
  }

  // Método rápido para cambiar estado (Ej: 2 = Confirmada, 4 = Cancelada)
  updateStatus(idBooking: string, newStatusId: number) {
    if(confirm('¿Estás seguro de cambiar el estado de esta reserva?')) {
      this.bookingService.changeStatus(idBooking, newStatusId).subscribe({
        next: (res) => {
          if (res.status) {
            this.loadBookings(); // Recargamos la tabla para ver el cambio
          } else {
            alert('Error: ' + res.msg);
          }
        },
        error: (err) => console.error(err)
      });
    }
  }
}