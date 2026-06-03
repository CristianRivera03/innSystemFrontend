import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { BookingService } from '../../../services/booking.service';
import { RoleService } from '../../../services/role.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-public-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './public-checkout.component.html',
  styleUrls: ['./public-checkout.component.scss']
})
export class PublicCheckoutComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private bookingService = inject(BookingService);
  private roleService = inject(RoleService);

  bookingData: any = null;
  currentUser: any = null;
  checkoutForm!: FormGroup;
  roles: any[] = [];

  isProcessing = false;
  showPassword = false;

  ngOnInit(): void {
    const data = sessionStorage.getItem('pendingBooking');
    if (!data) {
      this.router.navigate(['/home']);
      return;
    }

    this.bookingData = JSON.parse(data);
    this.initForm();
    
    const sessionUser = localStorage.getItem('userSession');
    if (sessionUser) {
      this.currentUser = JSON.parse(sessionUser);
    } else {
      this.loadRoles();
    }
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (res: any) => {
        this.roles = res.value || res || [];
      },
      error: (err) => {
        console.error("Error cargando roles", err);
      }
    });
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      documentId: ['', [Validators.required]],
      phone: ['', [Validators.maxLength(8)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onProceed() {
    if (this.currentUser) {
      this.createBookingAndPay(this.currentUser.idUser);
    } else {
      if (this.checkoutForm.invalid) {
        this.checkoutForm.markAllAsTouched();
        return;
      }
      this.registerAndPay();
    }
  }

  registerAndPay() {
    this.isProcessing = true;
    
    // Buscar el rol 'client' o 'cliente'
    let clientRoleId = 5; // Default fallback
    if (this.roles && this.roles.length > 0) {
      const clientRole = this.roles.find(r => r.roleName.toLowerCase().includes('client') || r.roleName.toLowerCase().includes('cliente'));
      if (clientRole) {
        clientRoleId = clientRole.idRole;
      }
    }

    const userData = {
      ...this.checkoutForm.value,
      idRole: clientRoleId
    };

    this.userService.signUp(userData).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        // Guardar el usuario en sesión si queremos auto-loguearlo (opcional)
        localStorage.setItem('userSession', JSON.stringify(response.value));
        
        this.createBookingAndPay(response.value.idUser);
      },
      error: (err) => {
        const errorMsg = err.error?.msg || err.message || "Error desconocido";
        alert("Fallo al registrar usuario: " + errorMsg);
        console.error(err);
        this.isProcessing = false;
      }
    });
  }

  createBookingAndPay(idUser: string) {
    this.isProcessing = true;
    
    const newBooking = {
      idUser: idUser,
      idRoom: Number(this.bookingData.room.idRoom),
      checkIn: this.bookingData.checkIn,
      checkOut: this.bookingData.checkOut,
      guestsCount: Number(this.bookingData.guestsCount)
    };

    this.bookingService.createBooking(newBooking).subscribe({
      next: (res: any) => {
        if (res.status && res.value) {
          sessionStorage.removeItem('pendingBooking');
          this.generateWompiPayment(res.value.idBooking);
        } else {
          alert(res.msg || "No se pudo generar la reserva.");
          this.isProcessing = false;
        }
      },
      error: (err) => {
        alert(err.error?.msg || "Error al conectar con el servidor.");
        console.error(err);
        this.isProcessing = false;
      }
    });
  }

  generateWompiPayment(bookingId: string) {
    fetch(`${environment.endpoint}Payment/wompi-link/${bookingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      this.isProcessing = false;
      if (data.urlEnlace) {
        // Redirect completely to Wompi
        window.location.href = data.urlEnlace; 
      } else {
        alert("Reserva creada, pero falló el enlace de Wompi.");
        this.router.navigate(['/my-bookings']);
      }
    })
    .catch(err => {
      this.isProcessing = false;
      alert("Error contactando al servicio de Wompi.");
      this.router.navigate(['/my-bookings']);
    });
  }
}
