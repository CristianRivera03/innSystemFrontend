export interface UserDTO {
    idUser: string;
    idRole: number;
    roleName?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentId?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreateDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    documentId?: string;
}

export interface ChangeUserRoleDTO{
    idUser : string;
    idRole : number;
}