import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { RoomDTO } from '../../models/room';
import { ResponseAPI } from '../../models/response-api';
import { RoomCreateModalComponent } from '../modals/room-create-modal/room-create-modal.component';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [RoomCreateModalComponent, CommonModule, FormsModule , ReactiveFormsModule],
  templateUrl: './room-management.component.html',
})


export class RoomManagementComponent implements OnInit {

  private roomService = inject(RoomService);
  rooms: RoomDTO[] = [];
  isCreateModalOpen: boolean = false;
  // Variables para edición de habitación
  selectedRoom: RoomDTO | null = null;

  // Abrir modal de creación de habitación
  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  

  ngOnInit(): void {
    this.loadRooms();
  }

  // Para editar habitacion
  openUpdateModal(room: RoomDTO) {
    this.selectedRoom = room;
    this.isCreateModalOpen = true;
  }

  closeRegistrerModal() {
    this.selectedRoom = null;
    this.isCreateModalOpen = false;
  }

  //Cargar habitaciones
  loadRooms() {
    this.roomService.getAllRooms().subscribe({
      next: (response : ResponseAPI<RoomDTO[]>) => {
        this.rooms = response.value;

        if(response.status){
          console.log("Rooms loaded successfully", this.rooms);
        }else{
          console.error("Failed to load rooms: " + response.msg);
        }
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  // Dar de baja (Inactivar habitacion)
  inactivateRoom(room: RoomDTO) {
    if (confirm(`¿Estás seguro de que deseas dar de baja la habitación #${room.roomNumber}?`)) {
      this.roomService.inactivateRoom(room.idRoom).subscribe({
        next: (response) => {
          if (response.status) {
            this.loadRooms(); // Recargar la lista para reflejar el estado actual
          } else {
            alert('Error al dar de baja la habitación: ' + response.msg);
          }
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Hubo un error al conectar con el servidor.');
        }
      });
    }
  }
}
