import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '../../../services/room-type.service';
import { RoomTypeDTO } from '../../../models/catalog';
import { ResponseAPI } from '../../../models/response-api';
import { RoomTypeModalComponent } from '../../modals/room-type-modal/room-type-modal.component';

@Component({
  selector: 'app-room-type-management',
  standalone: true,
  imports: [CommonModule, RoomTypeModalComponent],
  templateUrl: './room-type-management.component.html',
})
export class RoomTypeManagementComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  roomTypes: RoomTypeDTO[] = [];
  isModalOpen: boolean = false;
  selectedRoomType: RoomTypeDTO | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes() {
    this.isLoading = true;
    this.roomTypeService.getAll().subscribe({
      next: (response: ResponseAPI<RoomTypeDTO[]>) => {
        if (response.status) {
          this.roomTypes = response.value;
        } else {
          console.error("Failed to load room types:", response.msg);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading room types:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.selectedRoomType = null;
    this.isModalOpen = true;
  }

  openUpdateModal(type: RoomTypeDTO) {
    this.selectedRoomType = type;
    this.isModalOpen = true;
  }

  closeModal() {
    this.selectedRoomType = null;
    this.isModalOpen = false;
  }

  inactivateRoomType(type: RoomTypeDTO) {
    if (confirm(`¿Estás seguro de que deseas dar de baja el tipo "${type.name}"?`)) {
      this.roomTypeService.inactivate(type.idRoomType).subscribe({
        next: (response) => {
          if (response.status) {
            this.loadRoomTypes();
          } else {
            alert('Error al dar de baja el tipo: ' + response.msg);
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
