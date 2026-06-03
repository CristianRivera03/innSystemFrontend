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

    // Permitir acceso directo a 'my-bookings' para los clientes (sin requerir módulo en base de datos)
    if (urlDestino === '/my-bookings' && (user.roleName?.toLowerCase() === 'client' || user.roleName?.toLowerCase() === 'cliente')) {
      return true;
    }

    if (!user.allowedModules || user.allowedModules.length === 0) {
      console.warn("Acceso denegado: La cuenta no cuenta con permisos asignados.");
      router.navigate(["/home"]);
      return false;
    }

    //verifica si tiene los permisos con los modulos permitidos
    const tienePermiso = user.allowedModules.some(
      modulo => modulo.frontendPath === urlDestino
    )

    if (tienePermiso) {
      return true;
    } else {
      console.warn(`Acceso denegado: Intento de acceder al módulo '${urlDestino}' sin permisos.`);
      router.navigate(["/home"]);
      return false;
    }
  }

  //si no hay session retorna al home
  router.navigate(["/home"]);
  return false;
};
