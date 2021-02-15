import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBusyComponent } from './modal-busy.component';

describe('ModalBusyComponent', () => {
  let component: ModalBusyComponent;
  let fixture: ComponentFixture<ModalBusyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalBusyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalBusyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
