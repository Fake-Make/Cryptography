import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Work6Component } from './work6.component';

describe('Work6Component', () => {
  let component: Work6Component;
  let fixture: ComponentFixture<Work6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Work6Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Work6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
