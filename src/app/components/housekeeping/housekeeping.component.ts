import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { RoomDTO } from '../../models/room';
import { ResponseAPI } from '../../models/response-api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-housekeeping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './housekeeping.component.html',
})
export class HousekeepingComponent implements OnInit {

  private roomService = inject(RoomService);
  
  rooms: RoomDTO[] = [];
  filter: 'all' | 'maintenance' | 'active' = 'all';

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getAllRooms().subscribe({
      next: (response: ResponseAPI<RoomDTO[]>) => {
        if (response.status) {
          // Exclude Inactive (deleted) rooms if we only want to clean active/maintenance
          this.rooms = response.value.filter(r => r.idStatus !== 3); 
        }
      },
      error: (err) => console.error(err)
    });
  }

  get filteredRooms() {
    if (this.filter === 'maintenance') {
      return this.rooms.filter(r => r.idStatus === 2);
    }
    if (this.filter === 'active') {
      return this.rooms.filter(r => r.idStatus === 1);
    }
    return this.rooms;
  }

  changeStatus(room: RoomDTO, newStatusId: number) {
    // 1 = Active, 2 = Maintenance
    this.roomService.changeOperationalStatus(room.idRoom, newStatusId).subscribe({
      next: (res) => {
        if (res.status) {
          room.idStatus = newStatusId;
          room.operationalStatus = newStatusId === 1 ? 'Active' : 'Maintenance';
        } else {
          alert('Error al actualizar estado.');
        }
      },
      error: (err) => alert('Error de conexión.')
    });
  }

  exportToPDF() {
    const doc = new jsPDF();
    const roomsToClean = this.rooms.filter(r => r.idStatus === 2); // 2 = Maintenance/Sucia
    
    doc.setFontSize(18);
    doc.text('Reporte de Limpieza y Mantenimiento', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total a limpiar/revisar: ${roomsToClean.length} habitaciones`, 14, 40);

    const body = roomsToClean.map(r => [
      `Hab. #${r.roomNumber}`,
      r.roomType,
      `${r.guestCapacity} pax`,
      'Requiere Limpieza/Mantenimiento',
      '___________________' // Línea para firma
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Habitación', 'Tipo', 'Capacidad', 'Estado', 'Firma Mucama/Tec.']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [15, 98, 254] } // IBM Carbon Blue
    });

    doc.save(`Tareas_Limpieza_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
