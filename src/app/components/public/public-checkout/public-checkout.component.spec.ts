import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicCheckoutComponent } from './public-checkout.component';

describe('PublicCheckoutComponent', () => {
  let component: PublicCheckoutComponent;
  let fixture: ComponentFixture<PublicCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
