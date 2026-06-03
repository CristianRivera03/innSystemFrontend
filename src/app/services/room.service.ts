import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { CreateRoomDTO, RoomDTO } from '../models/room';
import{ RoomUpdateDTO } from '../models/room';


@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private http = inject(HttpClient);
  private apiURL = `${environment.endpoint}Room`

  constructor() { }


  //obtener todas las habitaciones
  getAllRooms() : Observable<ResponseAPI<RoomDTO[]>>{
    return this.http.get<ResponseAPI<RoomDTO[]>>(`${this.apiURL}`)
  }

  // Obtener habitaciones disponibles
  getAvailableRooms(checkIn: string, checkOut: string, guestsCount: number): Observable<ResponseAPI<RoomDTO[]>> {
    return this.http.get<ResponseAPI<RoomDTO[]>>(`${this.apiURL}/available?checkIn=${checkIn}&checkOut=${checkOut}&guestsCount=${guestsCount}`);
  }
  //crear habitacion
  createRoom(payload : CreateRoomDTO) : Observable<ResponseAPI<RoomDTO>>{
    const formData = new FormData();
    formData.append('roomNumber', payload.roomNumber);
    formData.append('idRoomType', payload.idRoomType.toString());
    formData.append('idStatus', payload.idStatus.toString());
    formData.append('basePrice', payload.basePrice.toString());
    if (payload.description) formData.append('description', payload.description);
    
    if (payload.serviceIds) {
      payload.serviceIds.forEach(id => formData.append('serviceIds', id.toString()));
    }
    if (payload.photographs) {
      payload.photographs.forEach(file => formData.append('photographs', file));
    }

    return this.http.post<ResponseAPI<RoomDTO>>(`${this.apiURL}`, formData);
  }

  //actualizar habitacion
  updateRoom(payload : RoomUpdateDTO) : Observable<ResponseAPI<RoomDTO>>{
    const formData = new FormData();
    formData.append('idRoomType', payload.idRoomType.toString());
    formData.append('idStatus', payload.idStatus.toString());
    formData.append('basePrice', payload.basePrice.toString());
    if (payload.description) formData.append('description', payload.description);
    
    if (payload.serviceIds) {
      payload.serviceIds.forEach(id => formData.append('serviceIds', id.toString()));
    }
    if (payload.photographs) {
      payload.photographs.forEach(file => formData.append('photographs', file));
    }
    if (payload.deletedPhotographIds) {
      payload.deletedPhotographIds.forEach(id => formData.append('deletedPhotographIds', id.toString()));
    }

    return this.http.put<ResponseAPI<RoomDTO>>(`${this.apiURL}/${payload.idRoom}`, formData);
  }

  //Soft delete habitacion (cambiar estatus a inactiva)
  inactivateRoom(idRoom : number) : Observable<ResponseAPI<RoomDTO>>{
    return this.http.delete<ResponseAPI<RoomDTO>>(`${this.apiURL}/${idRoom}`)
  }

  // Cambiar estatus operativo (para Housekeeping)
  changeOperationalStatus(idRoom: number, statusId: number): Observable<ResponseAPI<boolean>> {
    return this.http.patch<ResponseAPI<boolean>>(`${this.apiURL}/${idRoom}/status`, statusId, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


}
