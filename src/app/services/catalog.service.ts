import { HttpClient } from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { CatalogDTO } from '../models/catalog';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private http = inject(HttpClient);
  private apiURL = `${environment.endpoint}Catalog`;

  constructor() { }

  getAllCatalogs() : Observable<ResponseAPI<CatalogDTO>>{
    return this.http.get<ResponseAPI<CatalogDTO>>(`${this.apiURL}/GetAll`)
  }
}
