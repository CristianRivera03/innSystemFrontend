import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import localeEs from "@angular/common/locales/es"
import { registerLocaleData } from '@angular/common';



//Idioma
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(),
    {provide : LOCALE_ID, useValue : 'es-SV'}
  ]
};
