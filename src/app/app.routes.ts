import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { roleGuard } from './guards/role.guard';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { DatalogComponent } from './components/datalog/datalog.component';
import { RoomManagementComponent } from './components/room-management/room-management.component';
import { BookingManagementComponent } from './components/booking-management/booking-management.component';
import { GeneralManagementComponent } from './components/catalogs/general-management/general-management.component';
import { PaymentReturnComponent } from './components/payment-return/payment-return.component';
import { HousekeepingComponent } from './components/housekeeping/housekeeping.component';
import { FinancialReportsComponent } from './components/financial-reports/financial-reports.component';

// Public Components
import { PublicLayoutComponent } from './components/public/public-layout/public-layout.component';
import { HomeComponent } from './components/public/home/home.component';
import { PublicSearchComponent } from './components/public/public-search/public-search.component';
import { PublicCheckoutComponent } from './components/public/public-checkout/public-checkout.component';
import { MyBookingsComponent } from './components/public/my-bookings/my-bookings.component';
import { ForgotPasswordComponent } from './components/public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/public/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    
    // Rutas del Admin (Login y Dashboard)
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'payment-return', component: PaymentReturnComponent },

    // Vista Pública
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'search', component: PublicSearchComponent },
            { path: 'checkout', component: PublicCheckoutComponent },
            // My Bookings requiere estar autenticado (puedes usar un guard distinto si es necesario, 
            // o el roleGuard adaptado para aceptar 'Client')
            { 
                path: 'my-bookings', 
                component: MyBookingsComponent,
                canActivate: [roleGuard] // Asegúrate de que el roleGuard permita al Client entrar a esta ruta
            }
        ]
    },

    // Ruta padre del Dashboard Interno
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
            { path: 'user-management', 
                component: UserManagementComponent, 
                canActivate: [roleGuard]
            },

            { path: 'role-management', 
                component: RoleManagementComponent, 
                canActivate: [roleGuard]
            },

            { path: 'datalog', 
                component: DatalogComponent, 
                canActivate: [roleGuard]
            },

            {
                path: "booking-management",
                component: BookingManagementComponent,
                canActivate: [roleGuard]
            },

            {
                path: 'general-management',
                component: GeneralManagementComponent,
                canActivate: [roleGuard]
            },

            {
                path: 'housekeeping',
                component: HousekeepingComponent,
                canActivate: [roleGuard]
            },

            {
                path: 'reports',
                component: FinancialReportsComponent,
                canActivate: [roleGuard]
            }

        ]
    }
];
