import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { SeasonDTO, SeasonCreateDTO, SeasonUpdateDTO } from '../models/season';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private urlAPI: string = environment.endpoint + 'Season';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ResponseAPI<SeasonDTO[]>> {
    return this.http.get<ResponseAPI<SeasonDTO[]>>(this.urlAPI);
  }

  create(payload: SeasonCreateDTO): Observable<ResponseAPI<SeasonDTO>> {
    return this.http.post<ResponseAPI<SeasonDTO>>(this.urlAPI, payload);
  }

  update(id: number, payload: SeasonUpdateDTO): Observable<ResponseAPI<SeasonDTO>> {
    return this.http.put<ResponseAPI<SeasonDTO>>(`${this.urlAPI}/${id}`, payload);
  }

  inactivate(id: number): Observable<ResponseAPI<boolean>> {
    return this.http.delete<ResponseAPI<boolean>>(`${this.urlAPI}/${id}`);
  }
}
