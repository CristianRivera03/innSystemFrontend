export interface BookingDTO {
    idBooking: string;
    idUser: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentId?: string;
    idRoom: number;
    checkIn: string; 
    checkOut: string;
    guestsCount: number;
    totalCost: number;
    idStatus: number;
    status: string;
    cancelReason?: string;
}

export interface BookingCreateDTO {
    idUser: string;
    idRoom: number;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
}