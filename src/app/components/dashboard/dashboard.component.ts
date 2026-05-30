import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionDTO } from '../../models/session';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { BookingDTO } from '../../models/booking';
import { RoomDTO } from '../../models/room';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit {

  private router = inject(Router);
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);

  //usuario actual
  currentUser: SessionDTO | null = null;

  // Data
  bookings: BookingDTO[] = [];
  rooms: RoomDTO[] = [];

  // KPIs
  totalBookings = 0;
  pendingBookings = 0;
  confirmedBookings = 0;
  estimatedRevenue = 0;

  // Room stats
  totalRooms = 0;
  activeRooms = 0;
  maintenanceRooms = 0;
  inactiveRooms = 0;

  // Recent activity
  recentBookings: BookingDTO[] = [];

  // Current date
  currentDate = new Date();

  ngOnInit() {
    this.loadUserSession();
    if (this.currentUser){
      this.loadDashboardData();
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

  loadDashboardData() {
    // Cargar reservas
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        if (res.status) {
          this.bookings = res.value || [];
          this.calculateBookingKPIs();
        }
      },
      error: (err) => {
        console.error("Error al cargar reservas", err);
      }
    });

    // Cargar habitaciones
    this.roomService.getAllRooms().subscribe({
      next: (res) => {
        if (res.status) {
          this.rooms = res.value || [];
          this.calculateRoomStats();
        }
      },
      error: (err) => {
        console.error("Error al cargar habitaciones", err);
      }
    });
  }

  calculateBookingKPIs() {
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'Pending').length;
    this.confirmedBookings = this.bookings.filter(b => b.status === 'Confirmed').length;
    this.estimatedRevenue = this.bookings
      .filter(b => b.status !== 'Cancelled' && b.status !== 'No_Show')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    // Últimas 5 reservas (más recientes primero)
    this.recentBookings = [...this.bookings]
      .sort((a, b) => {
        const dateA = new Date(a.checkIn).getTime();
        const dateB = new Date(b.checkIn).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }

  calculateRoomStats() {
    this.totalRooms = this.rooms.length;
    this.activeRooms = this.rooms.filter(r => r.operationalStatus === 'Active').length;
    this.maintenanceRooms = this.rooms.filter(r => r.operationalStatus === 'Maintenance').length;
    this.inactiveRooms = this.rooms.filter(r => r.operationalStatus === 'Inactive').length;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'Pendiente',
      'Confirmed': 'Confirmada',
      'Completed': 'Completada',
      'Cancelled': 'Cancelada',
      'No_Show': 'No Show'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Pending': return 'cds-tag--yellow';
      case 'Confirmed': return 'cds-tag--blue';
      case 'Completed': return 'cds-tag--green';
      case 'Cancelled':
      case 'No_Show': return 'cds-tag--red';
      default: return 'cds-tag--gray';
    }
  }
}
