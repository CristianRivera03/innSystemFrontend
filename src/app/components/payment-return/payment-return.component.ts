import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cds-payment-return">
      <div class="cds-payment-return__card">

        <!-- Processing -->
        <ng-container *ngIf="state === 'processing'">
          <span class="material-symbols-outlined cds-payment-return__icon cds-payment-return__icon--spin">
            progress_activity
          </span>
          <h2 class="cds-payment-return__title">Verificando pago...</h2>
          <p class="cds-payment-return__subtitle">Por favor espera mientras confirmamos tu reserva.</p>
        </ng-container>

        <!-- Success -->
        <ng-container *ngIf="state === 'success'">
          <span class="material-symbols-outlined cds-payment-return__icon cds-payment-return__icon--success">
            check_circle
          </span>
          <h2 class="cds-payment-return__title">¡Pago confirmado!</h2>
          <p class="cds-payment-return__subtitle">
            Tu reserva ha sido confirmada correctamente.<br>
            <span class="cds-payment-return__ref" *ngIf="transactionId">
              Referencia: <strong>{{ transactionId }}</strong>
            </span>
          </p>
          <p class="cds-payment-return__redirect">Redirigiendo en {{ countdown }}s...</p>
        </ng-container>

        <!-- Error -->
        <ng-container *ngIf="state === 'error'">
          <span class="material-symbols-outlined cds-payment-return__icon cds-payment-return__icon--error">
            error
          </span>
          <h2 class="cds-payment-return__title">Algo salió mal</h2>
          <p class="cds-payment-return__subtitle">{{ errorMessage }}</p>
          <button class="cds-btn-primary" style="margin-top:1.5rem;" (click)="goToBookings()">
            <span class="material-symbols-outlined" style="font-size:1rem;">arrow_back</span>
            Ir a reservas
          </button>
        </ng-container>

        <!-- No booking ID -->
        <ng-container *ngIf="state === 'no-id'">
          <span class="material-symbols-outlined cds-payment-return__icon cds-payment-return__icon--warning">
            warning
          </span>
          <h2 class="cds-payment-return__title">Parámetros incompletos</h2>
          <p class="cds-payment-return__subtitle">
            No se recibió información de la transacción. Revisa manualmente el estado de tu reserva.
          </p>
          <button class="cds-btn-primary" style="margin-top:1.5rem;" (click)="goToBookings()">
            <span class="material-symbols-outlined" style="font-size:1rem;">calendar_today</span>
            Ver reservas
          </button>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .cds-payment-return {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--cds-background);
      padding: 1rem;
    }
    .cds-payment-return__card {
      background-color: var(--cds-layer-01);
      border: 1px solid var(--cds-border-subtle);
      border-top: 3px solid var(--cds-interactive);
      padding: 3rem 2.5rem;
      max-width: 28rem;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .dark .cds-payment-return__card {
      box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    }
    .cds-payment-return__icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
    }
    .cds-payment-return__icon--spin {
      color: var(--cds-interactive);
      animation: cds-spin 0.8s linear infinite;
    }
    .cds-payment-return__icon--success { color: var(--cds-support-success); }
    .cds-payment-return__icon--error   { color: var(--cds-support-error); }
    .cds-payment-return__icon--warning { color: #f1c21b; }

    .cds-payment-return__title {
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--cds-text-primary);
      margin-bottom: 0.75rem;
    }
    .cds-payment-return__subtitle {
      font-size: 0.875rem;
      color: var(--cds-text-secondary);
      line-height: 1.5;
    }
    .cds-payment-return__ref {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--cds-text-secondary);
    }
    .cds-payment-return__redirect {
      margin-top: 1rem;
      font-size: 0.8rem;
      color: var(--cds-text-secondary);
    }
  `]
})
export class PaymentReturnComponent implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  state: 'processing' | 'success' | 'error' | 'no-id' = 'processing';
  transactionId: string | null = null;
  errorMessage = '';
  countdown = 5;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    let bookingId: string | null = null;
    let transactionId: string | null = null;

    params.keys.forEach(k => {
      const lower = k.toLowerCase();
      if (lower === 'identificadorenlacecomercio' || lower === 'idenlacecomercio' || lower === 'bookingid') {
        bookingId = params.get(k);
      }
      if (lower === 'idtransaccion') {
        transactionId = params.get(k);
      }
    });

    this.transactionId = transactionId;

    // Debug: log todos los params recibidos de Wompi
    const allParams: Record<string, string> = {};
    params.keys.forEach(k => allParams[k] = params.get(k) ?? '');
    console.log('[PaymentReturn] Query params recibidos de Wompi:', allParams);

    if (!bookingId) {
      console.warn('[PaymentReturn] No se recibió identificadorEnlaceComercio');
      this.state = 'no-id';
      return;
    }

    console.log('[PaymentReturn] Confirmando reserva:', bookingId);

    // Llamar al endpoint dedicado de confirmación
    this.bookingService.confirmFromRedirect(bookingId, this.transactionId).subscribe({
      next: (res) => {
        console.log('[PaymentReturn] Respuesta del servidor:', res);
        if (res.status) {
          this.state = 'success';
          this.startCountdown();
        } else {
          this.state = 'error';
          this.errorMessage = 'No se pudo actualizar el estado: ' + (res.msg || '');
        }
      },
      error: (err: any) => {
        this.state = 'error';
        this.errorMessage = 'Error al conectar con el servidor. Verifica la reserva manualmente.';
        console.error('[PaymentReturn] Error HTTP:', err.status, err.error);
      }
    });
  }

  private startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.goToBookings();
      }
    }, 1000);
  }

  goToBookings(): void {
    this.router.navigate(['/dashboard/booking-management']);
  }
}
