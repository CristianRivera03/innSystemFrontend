export interface UserDTO {
    idUser: string;
    userName: string;
    email: string;
    nameUser: string;
    lastNameUser: string;
    roleName: string;
    idRole: number;
    
}

export interface UserCreateDTO {
    userName: string;
    email: string;
    password : string;
    nameUser: string;
    lastNameUser: string;
}


export interface ChangeUserRoleDTO{
    idUser : string;
    idRole : number;
}