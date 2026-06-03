import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { SeasonService } from '../../../services/season.service';
import { RoomDTO } from '../../../models/room';
import { SeasonDTO } from '../../../models/season';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-public-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-search.component.html',
  styleUrls: ['./public-search.component.scss']
})
export class PublicSearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private seasonService = inject(SeasonService);

  checkIn: string = '';
  checkOut: string = '';
  guests: number = 1;
  diffDays: number = 1;

  rooms: RoomDTO[] = [];
  seasons: SeasonDTO[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.checkIn = params['checkIn'];
      this.checkOut = params['checkOut'];
      this.guests = Number(params['guests']) || 1;

      if (!this.checkIn || !this.checkOut) {
        this.router.navigate(['/home']);
        return;
      }

      const inDate = new Date(this.checkIn);
      const outDate = new Date(this.checkOut);
      const diffTime = outDate.getTime() - inDate.getTime();
      this.diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;
    
    // First load seasons for price calculation
    this.seasonService.getAll().subscribe({
      next: (res: any) => {
        this.seasons = res.value || res || [];
        this.searchRooms();
      },
      error: (err) => {
        console.error("Error cargando temporadas", err);
        this.searchRooms(); // search anyway
      }
    });
  }

  searchRooms() {
    this.roomService.getAvailableRooms(this.checkIn, this.checkOut, this.guests).subscribe({
      next: (res: any) => {
        this.rooms = res.value || res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error buscando habitaciones", err);
        this.isLoading = false;
      }
    });
  }

  calculateDynamicCost(basePrice: number): { total: number, appliedSeasons: string[] } {
    let total = 0;
    let currentDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    const seasonsApplied = new Set<string>();
    
    while (currentDate < checkOutDate) {
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
    
    return { total, appliedSeasons: Array.from(seasonsApplied) };
  }

  bookRoom(room: RoomDTO) {
    const costData = this.calculateDynamicCost(room.basePrice);
    
    const bookingData = {
      room: room,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      guestsCount: this.guests,
      totalCost: costData.total,
      diffDays: this.diffDays,
      appliedSeasons: costData.appliedSeasons
    };

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    this.router.navigate(['/checkout']);
  }
}
