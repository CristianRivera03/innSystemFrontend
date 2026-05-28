import { Component, Input, Output, EventEmitter, OnInit, inject, output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogService } from '../../../services/catalog.service';
import { RoomService } from '../../../services/room.service';
import { CatalogDTO } from '../../../models/catalog';
import { CreateRoomDTO, RoomDTO, RoomUpdateDTO, RoomImageDTO, ServiceDTO } from '../../../models/room';
import { ResponseAPI } from '../../../models/response-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-create-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './room-create-modal.component.html',
})
export class RoomCreateModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private roomService = inject(RoomService);
  isDarkMode: boolean = false;

  //Eventos para comunicar 
  @Input() isOpen: boolean = false;
  @Input() roomToEdit: RoomDTO | null = null; // Para edición, si es null se asume creación
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit(); // dispara el evento
  }


  roomForm: FormGroup;
  catalogs: CatalogDTO | null = null;
  isLoading = true;
  isSaving = false;

  selectedServiceIds: Set<number> = new Set();
  selectedFiles: File[] = [];
  existingImages: RoomImageDTO[] = [];
  deletedPhotographIds: number[] = [];

  constructor() {
    this.roomForm = this.fb.group({
      roomNumber: ['', [Validators.required]],
      description: [''],
      idRoomType: ['', [Validators.required]],
      basePrice: ['', [Validators.required, Validators.min(0)]],
      idStatus: [1, [Validators.required]],
    })
  }

  ngOnInit(): void {

    const savedTheme = localStorage.getItem("theme");
    //verifica si la compu esta en obscuro
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add("dark")
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark")
    }


    //cargar los catálogos para el formulario
    this.catalogService.getAllCatalogs().subscribe({
      next: (response: ResponseAPI<CatalogDTO>) => {
        if (response.status) {
          this.catalogs = response.value;
        }
        this.isLoading = false;
      },

      //si hay error 
      error: (err) => {
        console.error("Error al cargar los catálogos", err);
        this.isLoading = false;
      }
    });
  };


  ngOnChanges(changes: SimpleChanges): void {
    // Si se recibe una habitación para editar, cargar sus datos en el formulario
    if (changes['isOpen'] && this.isOpen) {

      //para editar habitacion y hay una habitacion seleccionada
      if (this.roomToEdit) {

        this.roomForm.patchValue({

          roomNumber: this.roomToEdit.roomNumber,
          idRoomType: this.roomToEdit.idRoomType,
          basePrice: this.roomToEdit.basePrice,
          description: this.roomToEdit.description,
          idStatus: this.roomToEdit.idStatus,

        });

        // Cargar servicios existentes
        this.selectedServiceIds.clear();
        if (this.roomToEdit.services) {
           this.roomToEdit.services.forEach(s => this.selectedServiceIds.add(s.idService));
        }

        // Cargar imágenes existentes
        this.existingImages = this.roomToEdit.images ? [...this.roomToEdit.images] : [];
        this.deletedPhotographIds = [];
        this.selectedFiles = [];

        //Desahabilitar campos que no se pueden editar
        this.roomForm.get('roomNumber')?.disable();
        this.roomForm.get('idRoomType')?.disable();


      } else {
        //Si no hay habitacion seleccionada, se asume que es creación
        this.roomForm.reset({ idStatus: 1 });
        this.selectedServiceIds.clear();
        this.selectedFiles = [];
        this.existingImages = [];
        this.deletedPhotographIds = [];
        this.roomForm.get('roomNumber')?.enable();
        this.roomForm.get('idRoomType')?.enable();
      }
    }
  }

  //Envio de formulario
  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.roomToEdit) {
      // Logica de actualización de habitacion
      const updatePayload: RoomUpdateDTO = {
        idRoom: this.roomToEdit.idRoom,
        idRoomType: Number(this.roomForm.getRawValue().idRoomType),
        basePrice: Number(this.roomForm.getRawValue().basePrice),
        idStatus: Number(this.roomForm.getRawValue().idStatus),
        description: this.roomForm.getRawValue().description,
        serviceIds: Array.from(this.selectedServiceIds),
        photographs: this.selectedFiles,
        deletedPhotographIds: this.deletedPhotographIds
      };

      this.roomService.updateRoom(updatePayload).subscribe({
        next: (response) => {
          if (response.status) {
            this.onSuccess.emit(); // notificar al padre
            this.closeModal();
            this.roomForm.reset({ idStatus: 1 });
            this.selectedServiceIds.clear();
            this.selectedFiles = [];
            this.existingImages = [];
            this.deletedPhotographIds = [];
            this.roomForm.get('roomNumber')?.enable();
            this.roomForm.get('idRoomType')?.enable();
          } else {
            alert("Error al actualizar la habitación");
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error("Error al actualizar la habitación", err);
          alert("No se pudo actualizar la habitación");
          this.isSaving = false;
        }
      });
    } else {
      // Lógica de creación de habitación (preparar el payload)
      const newRoom: CreateRoomDTO = {
        roomNumber: this.roomForm.value.roomNumber,
        idRoomType: Number(this.roomForm.value.idRoomType),
        basePrice: Number(this.roomForm.value.basePrice),
        idStatus: Number(this.roomForm.value.idStatus),
        description: this.roomForm.value.description,
        serviceIds: Array.from(this.selectedServiceIds),
        photographs: this.selectedFiles
      };

      // se envia el formulario
      this.roomService.createRoom(newRoom).subscribe({
        next: (response) => {
          if (response.status) {
            this.onSuccess.emit(); //notificar al padre que se creo la sala
            this.closeModal();
            this.roomForm.reset({ idStatus: 1 }); // Limpiar campos del formulario
            this.selectedServiceIds.clear();
            this.selectedFiles = [];
          } else {
            alert("Error al crear la habitación");
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error("Error al crear la habitación", err);
          alert("No se pudo crear la habitación");
          this.isSaving = false;
        }
      });
    }
  }





  toggleService(id: number) {
    if (this.selectedServiceIds.has(id)) {
      this.selectedServiceIds.delete(id);
    } else {
      this.selectedServiceIds.add(id);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
    // reset input value so the same file can be selected again if removed
    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingImage(idImage: number, index: number) {
    this.deletedPhotographIds.push(idImage);
    this.existingImages.splice(index, 1);
  }

}
