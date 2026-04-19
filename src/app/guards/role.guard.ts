import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionDTO } from '../models/session';
import { JsonPipe } from '@angular/common';


export const roleGuard: CanActivateFn = (route, state) => {

  //inyeccion de dependencias
  const router = inject(Router);
  const sessionData = localStorage.getItem("userSession")

  if (sessionData) {
    const user: SessionDTO = JSON.parse(sessionData);

    //extraer la url destino
    const urlDestino = state.url.split("?")[0];

    if (!user.allowedModules || user.allowedModules.length === 0) {
      alert("Tu cuenta no tiene permisos asignados. Contacta al administrador.");
      router.navigate(["/login"]);
      return false;
    }

    //verifica si tiene los permisos con los modulos permitidos
    const tienePermiso = user.allowedModules.some(
      modulo => modulo.frontendPath === urlDestino
    )

    if (tienePermiso) {
      return true;
    } else {
      alert("What do you looking for?")
      const rutaReturn = user.allowedModules[0].frontendPath;
      router.navigate([rutaReturn]);
      return false;
    }
  }

  //si no hay session retorna al login
  router.navigate(["/login"]);
  return false;
};
