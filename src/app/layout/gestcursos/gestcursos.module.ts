import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestcursosRoutingModule } from './gestcursos-routing.module';
import { GestcursosComponent } from './gestcursos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MoodleService } from '../../shared/services/moodle.service';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    GestcursosRoutingModule
  ],
  declarations: [GestcursosComponent],
  providers: [MoodleService]
})
export class GestcursosModule { }
