export interface StatusDTO{
    id: number;
    name: string;
}

export interface RoomTypeDTO{
    idRoomType: number;
    name: string;
    basePrice: number;
    guestCapacity: number;
}

export interface CatalogDTO {
    roomTypes: RoomTypeDTO[];
    RoomStatuses: StatusDTO[];
}
