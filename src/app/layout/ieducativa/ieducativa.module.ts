import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IEducativaRoutingModule } from './ieducativa-routing.module';
import { IEducativaComponent } from './ieducativa.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Services } from '../../shared/services/services.service';
import { MoodleService } from '../../shared/services/moodle.service';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    IEducativaRoutingModule
  ],
  declarations: [IEducativaComponent],
  providers: [Services, MoodleService]
})
export class IEducativaModule { }
