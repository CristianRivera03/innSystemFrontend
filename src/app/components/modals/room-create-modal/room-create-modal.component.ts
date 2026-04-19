import { Component, Input, Output, EventEmitter, OnInit, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogService } from '../../../services/catalog.service';
import { RoomService } from '../../../services/room.service';
import { CatalogDTO } from '../../../models/catalog';
import { CreateRoomDTO } from '../../../models/room';
import { ResponseAPI } from '../../../models/response-api';


@Component({
  selector: 'app-room-create-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './room-create-modal.component.html',
})
export class RoomCreateModalComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private roomService = inject(RoomService);
  isDarkMode: boolean = false;

  //Eventos para comunicar 
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() roomCreate = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit(); // dispara el evento
  }


  roomForm: FormGroup;
  catalogs: CatalogDTO | null = null;
  isLoading = true;
  isSaving = false;

  constructor() {
    this.roomForm = this.fb.group({
      roomNumber: ['', [Validators.required]],
      description: [''],
      idRoomType: ['', [Validators.required]],
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


  //Envio de formulario
  onSubmit() : void{
    if(this.roomForm.invalid){
      this.roomForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    //preparar el payload

    const newRoom: CreateRoomDTO = {
      roomNumber: this.roomForm.value.roomNumber,
      idRoomType: Number(this.roomForm.value.idRoomType),
      idStatus: Number(this.roomForm.value.idStatus),
      description: this.roomForm.value.description,
    };


    //se envia el formulario
    this.roomService.createRoom(newRoom).subscribe({
      next : (response) => {
        if(response.status){
          this.roomCreate.emit(); //notificar al padre que se creo la sala
          this.closeModal();
          this.roomForm.reset({ idStatus: 1 }); // Limpiar campos del formulario
        } else{
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
