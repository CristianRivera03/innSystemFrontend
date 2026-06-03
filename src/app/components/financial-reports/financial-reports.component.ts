import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { BookingDTO } from '../../models/booking';
import { ResponseAPI } from '../../models/response-api';

// Export libraries
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-reports.component.html',
})
export class FinancialReportsComponent implements OnInit {

  private bookingService = inject(BookingService);

  allBookings: BookingDTO[] = [];
  filteredBookings: BookingDTO[] = [];

  // Filtros
  startDate: string = '';
  endDate: string = '';
  statusFilter: string = 'All'; // All, Completed, Confirmed, Pending, Cancelled

  // KPIs
  totalRevenue: number = 0;
  pendingRevenue: number = 0;
  totalBookings: number = 0;

  ngOnInit(): void {
    // Set default dates (first day of current month to today)
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];

    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe({
      next: (res: ResponseAPI<BookingDTO[]>) => {
        if (res.status) {
          this.allBookings = res.value || [];
          this.applyFilters();
        }
      },
      error: (err) => console.error(err)
    });
  }

  applyFilters() {
    let filtered = this.allBookings;

    // Filter by Date (CheckIn date)
    if (this.startDate) {
      filtered = filtered.filter(b => b.checkIn.split('T')[0] >= this.startDate);
    }
    if (this.endDate) {
      filtered = filtered.filter(b => b.checkIn.split('T')[0] <= this.endDate);
    }

    // Filter by Status
    if (this.statusFilter !== 'All') {
      filtered = filtered.filter(b => b.status === this.statusFilter);
    }

    this.filteredBookings = filtered;
    this.calculateKPIs();
  }

  calculateKPIs() {
    this.totalBookings = this.filteredBookings.length;
    
    // Total Revenue (Completed or Confirmed)
    this.totalRevenue = this.filteredBookings
      .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    // Pending Revenue (Pending status)
    this.pendingRevenue = this.filteredBookings
      .filter(b => b.status === 'Pending')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);
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

  // --- EXPORT FUNCTIONS ---

  exportToExcel() {
    const dataToExport = this.filteredBookings.map(b => ({
      'ID Reserva': b.idBooking,
      'Cliente': `${b.firstName} ${b.lastName}`,
      'Email': b.email,
      'Habitación': b.idRoom,
      'Check-in': new Date(b.checkIn).toLocaleDateString(),
      'Check-out': new Date(b.checkOut).toLocaleDateString(),
      'Estado': this.getStatusLabel(b.status),
      'Total ($)': b.totalCost
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Financiero');
    
    XLSX.writeFile(wb, `Reporte_Financiero_${this.startDate}_al_${this.endDate}.xlsx`);
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte Financiero - Hotel Continental', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Período: ${this.startDate} al ${this.endDate}`, 14, 32);
    doc.text(`Ingresos Totales: $${this.totalRevenue.toFixed(2)}`, 14, 40);
    doc.text(`Ingresos Pendientes: $${this.pendingRevenue.toFixed(2)}`, 100, 40);

    const body = this.filteredBookings.map(b => [
      b.idBooking,
      `${b.firstName} ${b.lastName}`,
      b.idRoom,
      new Date(b.checkIn).toLocaleDateString(),
      this.getStatusLabel(b.status),
      `$${b.totalCost}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['ID', 'Cliente', 'Hab.', 'Check-In', 'Estado', 'Total']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [15, 98, 254] } // IBM Carbon Blue
    });

    doc.save(`Reporte_Financiero_${this.startDate}_al_${this.endDate}.pdf`);
  }
}
