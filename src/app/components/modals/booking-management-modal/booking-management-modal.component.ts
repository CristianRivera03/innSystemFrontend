import { Component, Input, Output, EventEmitter, OnInit, inject, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { RoomService } from '../../../services/room.service';
import { UserService } from '../../../services/user.service';
import { CatalogService } from '../../../services/catalog.service';
import { BookingCreateDTO, BookingDTO } from '../../../models/booking';
import { RoomDTO } from '../../../models/room';
import { UserDTO } from '../../../models/user';
import { ResponseAPI } from '../../../models/response-api';
import { CommonModule } from '@angular/common';
import { RegistrerModalComponent } from '../registrer-modal/registrer-modal.component';
import { RoleDTO } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { StatusDTO } from '../../../models/catalog';
import { environment } from '../../../../environments/environment.development';
import { SeasonService } from '../../../services/season.service';
import { SeasonDTO } from '../../../models/season';

@Component({
  selector: 'app-booking-management-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RegistrerModalComponent],
  templateUrl: './booking-management-modal.component.html',
})
export class BookingManagementModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private catalogService = inject(CatalogService);
  private seasonService = inject(SeasonService);

  // Mapa de traducción para nombres que vienen del backend en inglés
  private statusLabels: Record<string, string> = {
    'Pending':   'Pendiente',
    'Confirmed': 'Confirmada',
    'Cancelled': 'Cancelada',
    'Completed': 'Completada',
    'No_Show':   'No Show',
  };

  @Input() isOpen: boolean = false;
  @Input() bookingToEdit: BookingDTO | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  bookingForm: FormGroup;
  rooms: RoomDTO[] = [];
  users: UserDTO[] = [];
  roles: RoleDTO[] = [];
  bookingStatuses: { id: number; name: string; label: string }[] = [];
  seasons: SeasonDTO[] = [];
  appliedSeasons: string[] = [];
  isLoading = true;
  isSaving = false;
  isDarkMode = false;
  
  isRegisterModalOpen = false;

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
    this.isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    if (this.isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    this.loadDependencies();

    // Reaccionar a cambios en las fechas y huéspedes para buscar habitaciones y calcular costo
    this.bookingForm.valueChanges.subscribe(val => {
      // Actualizar minCheckOutDate basado en checkIn
      if (val.checkIn) {
        const inDate = new Date(val.checkIn);
        inDate.setDate(inDate.getDate() + 1); // Check-out debe ser al menos al día siguiente
        this.minCheckOutDate = inDate.toISOString().split('T')[0];
        
        // Validar si la fecha actual de checkout es inválida respecto al nuevo checkin
        if (val.checkOut && val.checkOut < this.minCheckOutDate) {
          this.bookingForm.patchValue({ checkOut: '' }, { emitEvent: false });
        }
      } else {
        this.minCheckOutDate = this.minCheckInDate;
      }

      if (this.bookingForm.get('checkIn')?.valid && this.bookingForm.get('checkOut')?.valid && this.bookingForm.get('guestsCount')?.valid) {
        // Pre-calcular días
        const checkInDate = new Date(val.checkIn);
        const checkOutDate = new Date(val.checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          const selectedRoomId = this.bookingForm.get('idRoom')?.value;
          if (selectedRoomId) {
            const room = this.rooms.find(r => r.idRoom == selectedRoomId);
            if (room) {
              this.calculateDynamicCost(checkInDate, checkOutDate, room.basePrice);
            }
          }
        } else {
          this.totalCost = 0;
          this.appliedSeasons = [];
        }
      }
    });
  }

  minCheckInDate = new Date().toISOString().split('T')[0];
  minCheckOutDate = new Date().toISOString().split('T')[0];

  loadDependencies() {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({ next: (res: any) => this.roles = res.value || res || [] });
    this.catalogService.getAllCatalogs().subscribe({
      next: (res) => {
        const statuses = res.value?.bookingStatuses || [];
        this.bookingStatuses = statuses.map((s: StatusDTO) => ({
          id: s.id,
          name: s.name,
          label: this.statusLabels[s.name] || s.name
        }));
      },
      error: (err) => console.error('Error cargando estados de reserva', err)
    });
    this.seasonService.getAll().subscribe({
      next: (res: any) => this.seasons = res.value || res || [],
      error: (err) => console.error("Error cargando temporadas", err)
    });
    this.loadUsers();
    this.isLoading = false;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.value || res || [];
        this.filteredUsers = [...this.users];
      },
      error: (err) => console.error("Error cargando usuarios", err)
    });
  }

  // ==== BÚSQUEDA PREDICTIVA ====
  filteredUsers: UserDTO[] = [];
  userSearchTerm = '';
  isUserDropdownOpen = false;
  selectedUserText = '';

  filterUsers(event: any) {
    const term = event.target.value.toLowerCase();
    this.userSearchTerm = term;
    this.isUserDropdownOpen = true;
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => 
        u.firstName.toLowerCase().includes(term) || 
        u.lastName.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
  }

  selectUser(user: UserDTO) {
    this.bookingForm.patchValue({ idUser: user.idUser });
    this.selectedUserText = `${user.firstName} ${user.lastName} (${user.email})`;
    this.isUserDropdownOpen = false;
  }

  clearUserSelection() {
    this.bookingForm.patchValue({ idUser: '' });
    this.selectedUserText = '';
    this.userSearchTerm = '';
    this.filteredUsers = [...this.users];
  }

  // ==== FILTRO DISPONIBILIDAD ====
  searchAvailableRooms() {
    const checkIn = this.bookingForm.get('checkIn')?.value;
    const checkOut = this.bookingForm.get('checkOut')?.value;
    const guests = this.bookingForm.get('guestsCount')?.value;

    if (!checkIn || !checkOut || !guests) {
      alert("Por favor ingresa Check-In, Check-Out y N° de Huéspedes");
      return;
    }

    this.isLoading = true;
    this.roomService.getAvailableRooms(checkIn, checkOut, guests).subscribe({
      next: (res: any) => {
        this.rooms = res.value || res || [];
        this.isLoading = false;
        if (this.rooms.length === 0) {
          alert("No hay habitaciones disponibles para estas fechas y cantidad de huéspedes.");
        }
      },
      error: (err) => {
        console.error("Error buscando habitaciones", err);
        this.isLoading = false;
        alert("Error al buscar disponibilidad.");
      }
    });
  }

  totalCost = 0;

  calculateDynamicCost(checkIn: Date, checkOut: Date, basePrice: number) {
    let total = 0;
    let currentDate = new Date(checkIn);
    const seasonsApplied = new Set<string>();
    
    while (currentDate < checkOut) {
      let dailyMultiplier = 1.0;
      const currentIso = currentDate.toISOString().split('T')[0];
      
      const applicableSeason = this.seasons.find(s => {
        return currentIso >= s.startDate.split('T')[0] && currentIso <= s.endDate.split('T')[0];
      });
      
      if (applicableSeason) {
        dailyMultiplier = applicableSeason.priceMultiplier;
        seasonsApplied.add(`${applicableSeason.seasonName} (x${applicableSeason.priceMultiplier})`);
      }
      
      total += basePrice * dailyMultiplier;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.totalCost = total;
    this.appliedSeasons = Array.from(seasonsApplied);
  }

  openRegisterModal(event: Event) {
    event.preventDefault();
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  onUserRegistered() {
    this.loadUsers();
    this.closeRegisterModal();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.totalCost = 0;
      if (this.bookingToEdit) {
        this.bookingForm.patchValue({
          idUser: this.bookingToEdit.idUser,
          idRoom: this.bookingToEdit.idRoom,
          checkIn: this.bookingToEdit.checkIn.split('T')[0],
          checkOut: this.bookingToEdit.checkOut.split('T')[0],
          guestsCount: this.bookingToEdit.guestsCount,
          idStatus: this.bookingToEdit.idStatus,
        });
        this.totalCost = this.bookingToEdit.totalCost || 0;
        this.appliedSeasons = []; // Al editar no recalculamos para no confundir el precio histórico, a menos que cambie algo
        
        const usr = this.users.find(u => u.idUser === this.bookingToEdit?.idUser);
        if (usr) this.selectedUserText = `${usr.firstName} ${usr.lastName}`;

        this.bookingForm.disable();
        this.bookingForm.get('idStatus')?.enable();
      } else {
        this.bookingForm.enable();
        this.bookingForm.reset({ guestsCount: 1, idStatus: 1 });
        this.selectedUserText = '';
        this.rooms = []; // Limpiar habitaciones hasta que busque
        this.bookingForm.get('idStatus')?.disable();
      }
    }
  }

  closeModal() {
    this.onClose.emit();
  }

  onSubmit(payNow: boolean = false): void {
    if (this.bookingForm.invalid && !this.bookingToEdit) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.bookingToEdit) {
      const statusId = Number(this.bookingForm.getRawValue().idStatus);
      this.bookingService.changeStatus(this.bookingToEdit.idBooking, statusId).subscribe({
        next: (response) => {
          if (response.status) {
            this.onSuccess.emit();
            this.closeModal();
          } else alert("Error al actualizar el estado de la reserva");
          this.isSaving = false;
        },
        error: (err) => {
          console.error("Error al actualizar el estado", err);
          alert("No se pudo actualizar el estado de la reserva");
          this.isSaving = false;
        }
      });
    } else {
      const newBooking: BookingCreateDTO = {
        idUser: this.bookingForm.value.idUser,
        idRoom: Number(this.bookingForm.value.idRoom),
        checkIn: this.bookingForm.value.checkIn,
        checkOut: this.bookingForm.value.checkOut,
        guestsCount: Number(this.bookingForm.value.guestsCount),
      };

      this.bookingService.createBooking(newBooking).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          if (response.status && response.value) {
            if (payNow) {
              // Redirigir a Wompi (Flujo de Pago)
              this.generateWompiPayment(response.value.idBooking);
            } else {
              this.onSuccess.emit();
              this.closeModal();
            }
          } else {
            alert(response.msg || "Error al crear la reserva");
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert(err.error?.msg || "No se pudo crear la reserva");
        }
      });
    }
  }

  generateWompiPayment(bookingId: string) {
    this.isSaving = true;
    fetch(`${environment.endpoint}Payment/wompi-link/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      this.isSaving = false;
      if (data.urlEnlace) {
        window.open(data.urlEnlace, '_blank', 'noopener,noreferrer'); // Abre Wompi en nueva pestaña
        this.onSuccess.emit();
        this.closeModal();
      } else {
        alert("Reserva creada, pero hubo un error generando enlace de pago Wompi.");
        this.onSuccess.emit();
        this.closeModal();
      }
    })
    .catch(err => {
      this.isSaving = false;
      alert("Error contactando al servicio de Wompi.");
      this.onSuccess.emit();
      this.closeModal();
    });
  }
}
