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
    createdAt?: string;
    updatedAt?: string;
}

export interface UserCreateDTO {
    idRole: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    documentId?: string;
}

export interface ChangeUserRoleDTO {
    idUser: string;
    idRole: number;
}

export interface UserUpdateDTO {
    idRole: number;
    firstName: string;
    lastName: string;
    phone?: string;
    documentId?: string;
    isActive: boolean;
}