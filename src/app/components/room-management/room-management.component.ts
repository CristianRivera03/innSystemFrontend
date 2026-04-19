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
  styleUrl: './room-management.component.scss'
})


export class RoomManagementComponent implements OnInit {

  private roomService = inject(RoomService);
  rooms: RoomDTO[] = [];
  isCreateModalOpen: boolean = false;

  // Abrir modal de creación de habitación
  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  // Cerrar modal de creación de habitación
  closeRegistrerModal() {
    this.isCreateModalOpen = false;
  }

  ngOnInit(): void {
    this.loadRooms();
  }

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

}
