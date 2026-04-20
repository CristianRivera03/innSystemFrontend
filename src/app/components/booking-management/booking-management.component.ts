import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { BookingDTO } from '../../models/booking';
// Importaremos el modal cuando lo creemos en el siguiente paso
// import { BookingCreateModalComponent } from '../booking-create-modal/booking-create-modal.component'; 

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule], // Agregar el modal aquí después
  templateUrl: './booking-management.component.html'
})
export class BookingManagementComponent implements OnInit {

  private bookingService = inject(BookingService);

  bookings: BookingDTO[] = [];
  isLoading: boolean = true;
  
  // Variables para el Modal
  isModalOpen: boolean = false;

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
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
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