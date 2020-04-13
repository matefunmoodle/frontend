import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestcursosComponent } from './gestcursos.component';

describe('GestcursosComponent', () => {
  let component: GestcursosComponent;
  let fixture: ComponentFixture<GestcursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestcursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestcursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
