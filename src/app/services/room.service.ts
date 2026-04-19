import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { CreateRoomDTO, RoomDTO } from '../models/room';


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


  //crear habitacion
  createRoom(payload : CreateRoomDTO) : Observable<ResponseAPI<RoomDTO>>{
    return this.http.post<ResponseAPI<RoomDTO>>(`${this.apiURL}`, payload)
  }

}
