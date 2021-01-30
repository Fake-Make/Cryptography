import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Work5Component } from './work5.component';

describe('Work5Component', () => {
  let component: Work5Component;
  let fixture: ComponentFixture<Work5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Work5Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Work5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
