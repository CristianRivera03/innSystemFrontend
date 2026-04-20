import { Component, Input, Output, EventEmitter, OnInit, inject, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service';
import { UserService } from '../../../services/user.service';
import { BookingCreateDTO, BookingDTO } from '../../../models/booking';
import { RoomDTO } from '../../../models/room';
import { UserDTO } from '../../../models/user';
import { ResponseAPI } from '../../../models/response-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-management-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking-management-modal.component.html',
})
export class BookingManagementModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);
  private userService = inject(UserService);

  @Input() isOpen: boolean = false;
  @Input() bookingToEdit: BookingDTO | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  bookingForm: FormGroup;
  rooms: RoomDTO[] = [];
  users: UserDTO[] = [];
  isLoading = true;
  isSaving = false;
  isDarkMode = false;

  // Assuming generic statuses since we don't have a catalog endpoint for booking statuses
  bookingStatuses = [
    { id: 1, name: 'Pendiente' },
    { id: 2, name: 'Confirmada' },
    { id: 3, name: 'Completada' },
    { id: 4, name: 'Cancelada' }
  ];

  constructor() {
    this.bookingForm = this.fb.group({
      idUser: ['', [Validators.required]],
      idRoom: ['', [Validators.required]],
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      guestsCount: [1, [Validators.required, Validators.min(1)]],
      idStatus: [1, [Validators.required]],
    });
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    }

    this.loadDependencies();
  }

  loadDependencies() {
    this.isLoading = true;
    // Load users
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.value || res || [];
        console.log("Usuarios cargados para el select:", this.users);
        
        // Load rooms
        this.roomService.getAllRooms().subscribe({
          next: (roomRes: any) => {
            this.rooms = roomRes.value || roomRes || [];
            console.log("Habitaciones cargadas para el select:", this.rooms);
            
            this.isLoading = false;
          },
          error: (err) => {
            console.error("Error cargando habitaciones", err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error("Error cargando usuarios", err);
        this.isLoading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.bookingToEdit) {
        // Mode: Edit (Only status can be actually updated per backend, but let's populate all)
        this.bookingForm.patchValue({
          idUser: this.bookingToEdit.idUser,
          idRoom: this.bookingToEdit.idRoom,
          checkIn: this.bookingToEdit.checkIn.split('T')[0],
          checkOut: this.bookingToEdit.checkOut.split('T')[0],
          guestsCount: this.bookingToEdit.guestsCount,
          idStatus: this.bookingToEdit.idStatus,
        });

        // Disable everything except status
        this.bookingForm.get('idUser')?.disable();
        this.bookingForm.get('idRoom')?.disable();
        this.bookingForm.get('checkIn')?.disable();
        this.bookingForm.get('checkOut')?.disable();
        this.bookingForm.get('guestsCount')?.disable();
        this.bookingForm.get('idStatus')?.enable();
      } else {
        // Mode: Create
        this.bookingForm.reset({ guestsCount: 1, idStatus: 1 });
        this.bookingForm.get('idUser')?.enable();
        this.bookingForm.get('idRoom')?.enable();
        this.bookingForm.get('checkIn')?.enable();
        this.bookingForm.get('checkOut')?.enable();
        this.bookingForm.get('guestsCount')?.enable();
        this.bookingForm.get('idStatus')?.disable(); // Initially Pending, backend handles it or we pass it
      }
    }
  }

  closeModal() {
    this.onClose.emit();
  }

  onSubmit(): void {
    if (this.bookingForm.invalid && !this.bookingToEdit) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.bookingToEdit) {
      // Logic for Update: Only changeStatus is supported by the API
      const statusId = Number(this.bookingForm.getRawValue().idStatus);

      this.bookingService.changeStatus(this.bookingToEdit.idBooking, statusId).subscribe({
        next: (response) => {
          if (response.status) {
            this.onSuccess.emit();
            this.closeModal();
          } else {
            alert("Error al actualizar el estado de la reserva");
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error("Error al actualizar el estado", err);
          alert("No se pudo actualizar el estado de la reserva");
          this.isSaving = false;
        }
      });
    } else {
      // Logic for Create
      const newBooking: BookingCreateDTO = {
        idUser: this.bookingForm.value.idUser,
        idRoom: Number(this.bookingForm.value.idRoom),
        checkIn: this.bookingForm.value.checkIn,
        checkOut: this.bookingForm.value.checkOut,
        guestsCount: Number(this.bookingForm.value.guestsCount),
      };

      this.bookingService.createBooking(newBooking).subscribe({
        next: (response) => {
          if (response.status) {
            this.onSuccess.emit();
            this.closeModal();
          } else {
            alert(response.msg || "Error al crear la reserva");
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error("Error al crear la reserva", err);
          // Backend returns nice descriptive errors, like room not available
          const errMsg = err.error?.msg || err.error || "No se pudo crear la reserva";
          alert(errMsg);
          this.isSaving = false;
        }
      });
    }
  }
}
