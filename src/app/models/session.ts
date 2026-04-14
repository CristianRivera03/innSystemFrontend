import { ModuleDTO } from "./module";

export interface SessionDTO {
    idUser: string;
    userName: string;
    email: string;
    nameUser: string;
    lastNameUser: string;
    roleName: string;
    allowedModules : ModuleDTO[]

}
