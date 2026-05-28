import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeasonService } from '../../../services/season.service';
import { SeasonDTO } from '../../../models/season';
import { ResponseAPI } from '../../../models/response-api';
import { SeasonModalComponent } from '../../modals/season-modal/season-modal.component';

@Component({
  selector: 'app-season-management',
  standalone: true,
  imports: [CommonModule, SeasonModalComponent],
  templateUrl: './season-management.component.html',
})
export class SeasonManagementComponent implements OnInit {
  private seasonService = inject(SeasonService);
  seasons: SeasonDTO[] = [];
  isModalOpen: boolean = false;
  selectedSeason: SeasonDTO | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadSeasons();
  }

  loadSeasons() {
    this.isLoading = true;
    this.seasonService.getAll().subscribe({
      next: (response: ResponseAPI<SeasonDTO[]>) => {
        if (response.status) {
          this.seasons = response.value;
        } else {
          console.error("Failed to load seasons:", response.msg);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading seasons:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.selectedSeason = null;
    this.isModalOpen = true;
  }

  openUpdateModal(season: SeasonDTO) {
    this.selectedSeason = season;
    this.isModalOpen = true;
  }

  closeModal() {
    this.selectedSeason = null;
    this.isModalOpen = false;
  }

  inactivateSeason(season: SeasonDTO) {
    if (confirm(`¿Estás seguro de que deseas eliminar la temporada "${season.seasonName}"?`)) {
      this.seasonService.inactivate(season.idSeason).subscribe({
        next: (response) => {
          if (response.status) {
            this.loadSeasons();
          } else {
            alert('Error al eliminar la temporada: ' + response.msg);
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
