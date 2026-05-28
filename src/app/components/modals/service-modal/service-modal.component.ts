import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceCatalogService } from '../../../services/service-catalog.service';
import { ServiceDTO, ServiceCreateDTO, ServiceUpdateDTO } from '../../../models/room';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-modal.component.html',
})
export class ServiceModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() serviceToEdit: ServiceDTO | null = null;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private serviceCatalog = inject(ServiceCatalogService);

  serviceForm: FormGroup;
  isSaving: boolean = false;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.serviceToEdit) {
        this.serviceForm.patchValue({
          name: this.serviceToEdit.name
        });
      } else {
        this.serviceForm.reset();
      }
    }
  }

  closeModal() {
    this.serviceForm.reset();
    this.onClose.emit();
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.serviceToEdit) {
      const payload: ServiceUpdateDTO = {
        idService: this.serviceToEdit.idService,
        ...this.serviceForm.value
      };
      
      this.serviceCatalog.update(this.serviceToEdit.idService, payload).subscribe({
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
      const payload: ServiceCreateDTO = this.serviceForm.value;
      
      this.serviceCatalog.create(payload).subscribe({
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
