import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ResponseAPI } from '../models/response-api';
import { BookingCreateDTO, BookingDTO } from '../models/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private http = inject(HttpClient);
  private apiURL = `${environment.endpoint}Booking`


  constructor() { }

  getAllBookings(): Observable<ResponseAPI<BookingDTO[]>> {
    return this.http.get<ResponseAPI<BookingDTO[]>>(`${this.apiURL}/Get`);
  }

  getBookingById(id: string): Observable<ResponseAPI<BookingDTO>> {
    return this.http.get<ResponseAPI<BookingDTO>>(`${this.apiURL}/${id}`);
  }


  createBooking(booking: BookingCreateDTO): Observable<ResponseAPI<BookingDTO>> {
    return this.http.post<ResponseAPI<BookingDTO>>(`${this.apiURL}/Create`, booking);
  }


  changeStatus(id: string, statusId: number): Observable<ResponseAPI<boolean>> {
    // El backend espera un entero ([FromBody] int statusId)
    return this.http.patch<ResponseAPI<boolean>>(`${this.apiURL}/${id}/status`, statusId);
  }

  generateWompiPaymentLink(bookingId: string): Observable<{ urlEnlace: string }> {
    return this.http.post<{ urlEnlace: string }>(
      `${environment.endpoint}Payment/wompi-link/${bookingId}`,
      {}
    );
  }

  confirmFromRedirect(bookingId: string, idTransaccion: string | null): Observable<{ status: boolean; msg: string; currentStatus: number }> {
    const params: Record<string, string> = { bookingId };
    if (idTransaccion) params['idTransaccion'] = idTransaccion;
    return this.http.post<{ status: boolean; msg: string; currentStatus: number }>(
      `${environment.endpoint}Payment/confirm-from-redirect`,
      {},
      { params }
    );
  }

}
