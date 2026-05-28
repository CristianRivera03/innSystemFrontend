import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCatalogService } from '../../../services/service-catalog.service';
import { ServiceDTO } from '../../../models/room';
import { ResponseAPI } from '../../../models/response-api';
import { ServiceModalComponent } from '../../modals/service-modal/service-modal.component';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, ServiceModalComponent],
  templateUrl: './service-management.component.html',
})
export class ServiceManagementComponent implements OnInit {
  private serviceCatalog = inject(ServiceCatalogService);
  services: ServiceDTO[] = [];
  isModalOpen: boolean = false;
  selectedService: ServiceDTO | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.serviceCatalog.getAll().subscribe({
      next: (response: ResponseAPI<ServiceDTO[]>) => {
        if (response.status) {
          this.services = response.value;
        } else {
          console.error("Failed to load services:", response.msg);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.selectedService = null;
    this.isModalOpen = true;
  }

  openUpdateModal(service: ServiceDTO) {
    this.selectedService = service;
    this.isModalOpen = true;
  }

  closeModal() {
    this.selectedService = null;
    this.isModalOpen = false;
  }

  inactivateService(service: ServiceDTO) {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) {
      this.serviceCatalog.inactivate(service.idService).subscribe({
        next: (response) => {
          if (response.status) {
            this.loadServices();
          } else {
            alert('Error al eliminar el servicio: ' + response.msg);
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
