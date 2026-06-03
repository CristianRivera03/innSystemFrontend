import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionDTO } from '../../models/session';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { BookingDTO } from '../../models/booking';
import { RoomDTO } from '../../models/room';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
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
  
  // Daily operations
  checkInsToday: BookingDTO[] = [];
  checkOutsToday: BookingDTO[] = [];

  // Current date
  currentDate = new Date();

  // --- Chart.js Configurations ---

  // 1. Room Status Doughnut Chart
  public doughnutChartLabels: string[] = [ 'Activas', 'Mantenimiento', 'Inactivas' ];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      { 
        data: [0, 0, 0],
        backgroundColor: ['#24a148', '#f1c21b', '#da1e28'],
        hoverBackgroundColor: ['#198038', '#d2a106', '#a2191f'],
        borderWidth: 0
      }
    ]
  };
  public doughnutChartType: 'doughnut' = 'doughnut';
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#8d8d8d' } }
    },
    cutout: '75%'
  };

  // 2. Revenue Bar Chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8d8d8d' } },
      y: { grid: { color: '#393939' }, ticks: { color: '#8d8d8d' } }
    }
  };
  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Hace 4 Meses', 'Hace 3 Meses', 'Hace 2 Meses', 'Mes Pasado', 'Este Mes'],
    datasets: [
      { 
        data: [0, 0, 0, 0, 0], 
        label: 'Ingresos ($)',
        backgroundColor: '#0f62fe',
        hoverBackgroundColor: '#0043ce',
        borderRadius: 4
      }
    ]
  };

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
      
    // Operaciones diarias
    const todayStr = new Date().toISOString().split('T')[0];
    this.checkInsToday = this.bookings.filter(b => b.checkIn.split('T')[0] === todayStr && b.status !== 'Cancelled');
    this.checkOutsToday = this.bookings.filter(b => b.checkOut.split('T')[0] === todayStr && b.status !== 'Cancelled');
    
    this.calculateRevenueChartData();
  }

  calculateRevenueChartData() {
    // Basic simulation for the last 5 months based on bookings
    const monthlyRevenue = [0, 0, 0, 0, 0];
    const now = new Date();
    
    this.bookings.forEach(b => {
      if (b.status === 'Cancelled' || b.status === 'No_Show') return;
      const bDate = new Date(b.checkIn);
      // Diff in months
      const diffMonths = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth());
      if (diffMonths >= 0 && diffMonths < 5) {
        // Index 4 is current month, index 0 is 4 months ago
        monthlyRevenue[4 - diffMonths] += (b.totalCost || 0);
      }
    });

    this.barChartData.datasets[0].data = monthlyRevenue;
    // Update chart references to trigger change detection
    this.barChartData = { ...this.barChartData };
  }

  calculateRoomStats() {
    this.totalRooms = this.rooms.length;
    this.activeRooms = this.rooms.filter(r => r.operationalStatus === 'Active').length;
    this.maintenanceRooms = this.rooms.filter(r => r.operationalStatus === 'Maintenance').length;
    this.inactiveRooms = this.rooms.filter(r => r.operationalStatus === 'Inactive').length;
    
    // Update Doughnut Chart
    this.doughnutChartData.datasets[0].data = [this.activeRooms, this.maintenanceRooms, this.inactiveRooms];
    this.doughnutChartData = { ...this.doughnutChartData };
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
