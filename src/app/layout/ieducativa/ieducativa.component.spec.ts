import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IEducativaComponent } from './ieducativa.component';

describe('IEducativaComponent', () => {
  let component: IEducativaComponent;
  let fixture: ComponentFixture<IEducativaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IEducativaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IEducativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
