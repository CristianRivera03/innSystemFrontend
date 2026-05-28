export interface StatusDTO{
    id: number;
    name: string;
}

export interface RoomTypeDTO{
    idRoomType: number;
    name: string;
    description?: string;
    guestCapacity: number;
}

export interface RoomTypeCreateDTO{
    name: string;
    description?: string;
    guestCapacity: number;
}

export interface RoomTypeUpdateDTO{
    idRoomType: number;
    name: string;
    description?: string;
    guestCapacity: number;
}

import { ServiceDTO } from "./room";

export interface CatalogDTO {
    roomTypes: RoomTypeDTO[];
    roomStatuses: StatusDTO[];
    services: ServiceDTO[];
}
