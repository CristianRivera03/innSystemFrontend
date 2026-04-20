export interface RoomDTO {
    idRoom: number;
    roomNumber: string;
    idRoomType?: number;
    roomType: string;
    description?: string;
    basePrice: number;
    guestCapacity: number;
    idStatus: number;
    operationalStatus?: string;
    createdAt?: Date;
}


export interface CreateRoomDTO {
    roomNumber: string;
    idRoomType: number;
    idStatus: number;
    description ?: string;
}


export interface RoomUpdateDTO {
    idRoom: number;
    idRoomType: number;
    idStatus : number;
    description ?: string;
}