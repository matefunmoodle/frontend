import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificacionComponent } from './notificacion.component';

import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    imports: [CommonModule, RouterModule, NgbAlertModule],
    declarations: [NotificacionComponent],
    exports: [NotificacionComponent]
})

export class NotificacionModule { }
