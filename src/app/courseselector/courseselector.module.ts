import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CourseSelectorRoutingModule } from './courseselector-routing.module'; //crear
import { CourseSelectorComponent } from './courseselector.component'; //crear
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../shared/services/authentication.service';
import { CourselinkComponent } from './courselink/courselink.component';

@NgModule({
  imports: [
  	FormsModule,
    CommonModule,
    CourseSelectorRoutingModule,
    NgbModule.forRoot(),
  ],
  declarations: [CourseSelectorComponent, CourselinkComponent],
  providers: [AuthenticationService]
})
export class CourseSelectorModule { }
