import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HousekeepingComponent } from './housekeeping.component';

describe('HousekeepingComponent', () => {
  let component: HousekeepingComponent;
  let fixture: ComponentFixture<HousekeepingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HousekeepingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HousekeepingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
