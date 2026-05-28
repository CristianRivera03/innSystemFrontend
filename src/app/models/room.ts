export interface ServiceDTO {
    idService: number;
    name: string;
}

export interface ServiceCreateDTO {
    name: string;
}

export interface ServiceUpdateDTO {
    idService: number;
    name: string;
}

export interface RoomImageDTO {
    idImage: number;
    url: string;
    description?: string;
}

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
    services?: ServiceDTO[];
    images?: RoomImageDTO[];
}


export interface CreateRoomDTO {
    roomNumber: string;
    idRoomType: number;
    idStatus: number;
    description ?: string;
    basePrice: number;
    serviceIds?: number[];
    photographs?: File[];
}


export interface RoomUpdateDTO {
    idRoom: number;
    idRoomType: number;
    idStatus : number;
    description ?: string;
    basePrice: number;
    serviceIds?: number[];
    photographs?: File[];
    deletedPhotographIds?: number[];
}