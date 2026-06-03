import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  private fb = inject(FormBuilder);
  private router = inject(Router);

  minDate = new Date().toISOString().split('T')[0];
  minOutDate = new Date().toISOString().split('T')[0];

  constructor() {
    this.searchForm = this.fb.group({
      checkIn: ['', [Validators.required]],
      checkOut: ['', [Validators.required]],
      guests: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.searchForm.get('checkIn')?.valueChanges.subscribe(val => {
      if (val) {
        const inDate = new Date(val);
        inDate.setDate(inDate.getDate() + 1);
        this.minOutDate = inDate.toISOString().split('T')[0];
        
        if (this.searchForm.value.checkOut && this.searchForm.value.checkOut < this.minOutDate) {
          this.searchForm.patchValue({ checkOut: '' });
        }
      }
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.router.navigate(['/search'], {
        queryParams: {
          checkIn: this.searchForm.value.checkIn,
          checkOut: this.searchForm.value.checkOut,
          guests: this.searchForm.value.guests
        }
      });
    } else {
      this.searchForm.markAllAsTouched();
    }
  }
}
