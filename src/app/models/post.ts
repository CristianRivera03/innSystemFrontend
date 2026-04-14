export interface PostCreateDTO {
    idUser: string;
    idCategory: number;
    titlePost: string;
    contentPost: string;
}

export interface PostDTO {
    idPost: string;
    idUser: string;
    completeNameUser: string;
    idCategory: number;
    nameCategory: string;
    titlePost: string;
    contentPost: string;
    isDeleted: boolean;
    publishedAt: Date;
    updatedAt: Date;
    deleteAt: Date;
}