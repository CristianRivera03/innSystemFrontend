export interface SeasonDTO {
    idSeason: number;
    seasonName: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
}

export interface SeasonCreateDTO {
    seasonName: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
}

export interface SeasonUpdateDTO {
    idSeason: number;
    seasonName: string;
    startDate: string;
    endDate: string;
    priceMultiplier: number;
}
