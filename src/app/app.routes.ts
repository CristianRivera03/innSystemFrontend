import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagerUserComponent } from './components/manager-user/manager-user.component';
import { roleGuard } from './guards/role.guard';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { RoleManagerComponent } from './components/role-manager/role-manager.component';
import { DatalogComponent } from './components/datalog/datalog.component';
import { RoomManagementComponent } from './components/room-management/room-management.component';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    //{path: "signup" , component: SignUpComponent},

    //Ruta padre 
    {
        path: 'dashboard',
        component: LayoutComponent,
        children: [
            // si entran a dashboard se redirige a dashboard/feed
            { path: '', redirectTo: 'feed', pathMatch: 'full' },

            { path: 'feed',
                component: DashboardComponent,
                canActivate : [roleGuard]
            },

            {path: 'room-management',
                component: RoomManagementComponent,
                canActivate : [roleGuard]
            },
            
            
            //Gestor de usuarios
            { path: 'manager-users', 
                component: ManagerUserComponent, 
                canActivate: [roleGuard]
            },

            { path: 'role-manager', 
                component: RoleManagerComponent, 
                canActivate: [roleGuard]
            },

            { path: 'datalog', 
                component: DatalogComponent, 
                canActivate: [roleGuard]
            }


        ]
    }
];
