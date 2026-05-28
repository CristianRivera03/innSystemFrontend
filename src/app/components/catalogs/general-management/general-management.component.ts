import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeManagementComponent } from '../room-type-management/room-type-management.component';
import { ServiceManagementComponent } from '../service-management/service-management.component';
import { SeasonManagementComponent } from '../season-management/season-management.component';

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, RoomTypeManagementComponent, ServiceManagementComponent, SeasonManagementComponent],
  templateUrl: './general-management.component.html',
})
export class GeneralManagementComponent {
}
