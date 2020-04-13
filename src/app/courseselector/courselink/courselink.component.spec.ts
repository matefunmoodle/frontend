import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourselinkComponent } from './courselink.component';

describe('CourselinkComponent', () => {
  let component: CourselinkComponent;
  let fixture: ComponentFixture<CourselinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourselinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourselinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
