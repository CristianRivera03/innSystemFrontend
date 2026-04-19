import { ModuleDTO } from "./module";

export interface SessionDTO {
    idUser: string;
    firstName: string;
    lastName: string;
    email: string;
    roleName?: string;
    allowedModules: ModuleDTO[];
}
