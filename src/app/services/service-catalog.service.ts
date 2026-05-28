import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { ServiceDTO, ServiceCreateDTO, ServiceUpdateDTO } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogService {
  private urlAPI: string = environment.endpoint + 'Service';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ResponseAPI<ServiceDTO[]>> {
    return this.http.get<ResponseAPI<ServiceDTO[]>>(`${this.urlAPI}`);
  }

  getById(id: number): Observable<ResponseAPI<ServiceDTO>> {
    return this.http.get<ResponseAPI<ServiceDTO>>(`${this.urlAPI}/${id}`);
  }

  create(payload: ServiceCreateDTO): Observable<ResponseAPI<ServiceDTO>> {
    return this.http.post<ResponseAPI<ServiceDTO>>(`${this.urlAPI}`, payload);
  }

  update(id: number, payload: ServiceUpdateDTO): Observable<ResponseAPI<ServiceDTO>> {
    return this.http.put<ResponseAPI<ServiceDTO>>(`${this.urlAPI}/${id}`, payload);
  }

  inactivate(id: number): Observable<ResponseAPI<boolean>> {
    return this.http.delete<ResponseAPI<boolean>>(`${this.urlAPI}/${id}`);
  }
}
