import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursosRoutingModule } from './cursos-routing.module';
import { CursosComponent } from './cursos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Services } from '../../shared/services/services.service';

@NgModule({
  imports: [
    CommonModule,
    CursosRoutingModule,
    FormsModule,
    NgbModule
  ],
  declarations: [CursosComponent],
  providers: [Services]
})
export class CursosModule { }
