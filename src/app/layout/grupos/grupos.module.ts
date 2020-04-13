import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GruposComponent } from './grupos.component';
import { CommonModule } from '@angular/common';
import { GruposRoutingModule } from './grupos-routing.module';
import { DialogService } from "ng2-bootstrap-modal";
import { NotificacionService } from '../../shared/services/notificacion.service';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodemirrorModule } from 'ng2-codemirror';
import { NotificacionModule } from '../../notificacion/notificacion.module'; 

@NgModule({
    imports: [CommonModule, GruposRoutingModule, FormsModule,BootstrapModalModule, NgbModule, CodemirrorModule,NotificacionModule],
    declarations: [GruposComponent],
    exports: [GruposComponent],
    entryComponents: []
})

export class GruposModule { }
