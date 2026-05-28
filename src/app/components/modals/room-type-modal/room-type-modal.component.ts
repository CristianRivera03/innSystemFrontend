import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomTypeService } from '../../../services/room-type.service';
import { RoomTypeDTO, RoomTypeCreateDTO, RoomTypeUpdateDTO } from '../../../models/catalog';

@Component({
  selector: 'app-room-type-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-type-modal.component.html',
})
export class RoomTypeModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() typeToEdit: RoomTypeDTO | null = null;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private roomTypeService = inject(RoomTypeService);

  typeForm: FormGroup;
  isSaving: boolean = false;

  constructor() {
    this.typeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      guestCapacity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.typeToEdit) {
        this.typeForm.patchValue({
          name: this.typeToEdit.name,
          description: this.typeToEdit.description,
          guestCapacity: this.typeToEdit.guestCapacity
        });
      } else {
        this.typeForm.reset({ guestCapacity: 1 });
      }
    }
  }

  closeModal() {
    this.typeForm.reset({ guestCapacity: 1 });
    this.onClose.emit();
  }

  onSubmit() {
    if (this.typeForm.invalid) {
      this.typeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.typeToEdit) {
      const payload: RoomTypeUpdateDTO = {
        idRoomType: this.typeToEdit.idRoomType,
        ...this.typeForm.value
      };
      
      this.roomTypeService.update(this.typeToEdit.idRoomType, payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.status) {
            this.onSuccess.emit();
            this.closeModal();
          } else {
            alert('Error: ' + res.msg);
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert('Ocurrió un error al guardar');
        }
      });
    } else {
      const payload: RoomTypeCreateDTO = this.typeForm.value;
      
      this.roomTypeService.create(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.status) {
            this.onSuccess.emit();
            this.closeModal();
          } else {
            alert('Error: ' + res.msg);
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert('Ocurrió un error al crear');
        }
      });
    }
  }
}
