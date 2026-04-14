import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrerModalComponent } from './registrer-modal.component';

describe('RegistrerModalComponent', () => {
  let component: RegistrerModalComponent;
  let fixture: ComponentFixture<RegistrerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
