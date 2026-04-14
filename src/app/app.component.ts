import { ApplicationConfig, Component } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
//importaciones
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig ={
  providers : [
    provideRouter(routes),
    provideHttpClient()
  ]
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'Conecta2-Web';
}
