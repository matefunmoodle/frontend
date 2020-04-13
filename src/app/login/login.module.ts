import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../shared/services/authentication.service';

@NgModule({
  imports: [
  	FormsModule,
    CommonModule,
    LoginRoutingModule,
    NgbModule.forRoot(),
  ],
  declarations: [LoginComponent],
  providers: [AuthenticationService]
})
export class LoginModule { }
