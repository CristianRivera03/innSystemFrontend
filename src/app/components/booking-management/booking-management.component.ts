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
  payingBookingId: string | null = null;  // id de la reserva que está generando link de pago
  
  // Variables para el Modal
  isModalOpen: boolean = false;
  selectedBooking: BookingDTO | null = null;

  // Variables de Paginación
  currentPage: number = 1;
  pageSize: number = 10;

  get paginatedBookings(): BookingDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.bookings.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.bookings.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        if (res.status) {
          this.bookings = res.value;
          this.currentPage = 1; // Reiniciar a la primera página al cargar
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

  // ── Acciones rápidas de estado ────────────────────────────
  confirmBooking(idBooking: string) {
    if (confirm('¿Confirmar esta reserva? El huésped quedará registrado como confirmado.')) {
      this.updateStatus(idBooking, 2);
    }
  }

  completeBooking(idBooking: string) {
    if (confirm('¿Marcar esta reserva como Completada? Esto indica que el huésped ya realizó su estancia.')) {
      this.updateStatus(idBooking, 4); // 4 = Completed
    }
  }

  cancelBooking(idBooking: string) {
    if (confirm('¿Cancelar esta reserva? Esta acción no se puede deshacer fácilmente.')) {
      this.updateStatus(idBooking, 3); // 3 = Cancelled
    }
  }

  payBooking(idBooking: string) {
    this.payingBookingId = idBooking;
    this.bookingService.generateWompiPaymentLink(idBooking).subscribe({
      next: (res) => {
        this.payingBookingId = null;
        if (res.urlEnlace) {
          window.location.href = res.urlEnlace;
        } else {
          alert('No se pudo generar el enlace de pago. Intenta de nuevo.');
        }
      },
      error: (err) => {
        this.payingBookingId = null;
        console.error('Error generando link Wompi:', err);
        alert('Error al conectar con el servicio de pago.');
      }
    });
  }

  private updateStatus(idBooking: string, newStatusId: number) {
    this.bookingService.changeStatus(idBooking, newStatusId).subscribe({
      next: (res) => {
        if (res.status) {
          this.loadBookings();
        } else {
          alert('Error al cambiar el estado: ' + res.msg);
        }
      },
      error: (err) => console.error(err)
    });
  }
}