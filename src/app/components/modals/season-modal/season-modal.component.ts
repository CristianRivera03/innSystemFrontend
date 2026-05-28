import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeasonService } from '../../../services/season.service';
import { SeasonDTO, SeasonCreateDTO, SeasonUpdateDTO } from '../../../models/season';

@Component({
  selector: 'app-season-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './season-modal.component.html',
})
export class SeasonModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() seasonToEdit: SeasonDTO | null = null;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private seasonService = inject(SeasonService);

  seasonForm: FormGroup;
  isSaving: boolean = false;

  constructor() {
    this.seasonForm = this.fb.group({
      seasonName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      priceMultiplier: [1.0, [Validators.required, Validators.min(0.01), Validators.max(10.0)]]
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.seasonToEdit) {
        this.seasonForm.patchValue({
          seasonName: this.seasonToEdit.seasonName,
          startDate: this.seasonToEdit.startDate,
          endDate: this.seasonToEdit.endDate,
          priceMultiplier: this.seasonToEdit.priceMultiplier
        });
      } else {
        this.seasonForm.reset({ priceMultiplier: 1.0 });
      }
    }
  }

  closeModal() {
    this.seasonForm.reset({ priceMultiplier: 1.0 });
    this.onClose.emit();
  }

  onSubmit() {
    if (this.seasonForm.invalid) {
      this.seasonForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.seasonToEdit) {
      const payload: SeasonUpdateDTO = {
        idSeason: this.seasonToEdit.idSeason,
        ...this.seasonForm.value
      };
      
      this.seasonService.update(this.seasonToEdit.idSeason, payload).subscribe({
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
      const payload: SeasonCreateDTO = this.seasonForm.value;
      
      this.seasonService.create(payload).subscribe({
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
