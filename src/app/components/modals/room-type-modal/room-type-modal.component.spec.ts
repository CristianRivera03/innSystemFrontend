import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTypeModalComponent } from './room-type-modal.component';

describe('RoomTypeModalComponent', () => {
  let component: RoomTypeModalComponent;
  let fixture: ComponentFixture<RoomTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
