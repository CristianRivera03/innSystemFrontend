import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { RoomTypeDTO, RoomTypeCreateDTO, RoomTypeUpdateDTO } from '../models/catalog';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private urlAPI: string = environment.endpoint + 'RoomType';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ResponseAPI<RoomTypeDTO[]>> {
    return this.http.get<ResponseAPI<RoomTypeDTO[]>>(`${this.urlAPI}`);
  }

  getById(id: number): Observable<ResponseAPI<RoomTypeDTO>> {
    return this.http.get<ResponseAPI<RoomTypeDTO>>(`${this.urlAPI}/${id}`);
  }

  create(payload: RoomTypeCreateDTO): Observable<ResponseAPI<RoomTypeDTO>> {
    return this.http.post<ResponseAPI<RoomTypeDTO>>(`${this.urlAPI}`, payload);
  }

  update(id: number, payload: RoomTypeUpdateDTO): Observable<ResponseAPI<RoomTypeDTO>> {
    return this.http.put<ResponseAPI<RoomTypeDTO>>(`${this.urlAPI}/${id}`, payload);
  }

  inactivate(id: number): Observable<ResponseAPI<boolean>> {
    return this.http.delete<ResponseAPI<boolean>>(`${this.urlAPI}/${id}`);
  }
}
