import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasModule } from '../canvas/canvas.module'
import { MateFunComponent } from './matefun.component';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from './confirm.component';
import { SeleccionarDirectorioComp } from './seleccionarDirectorio.component';
import { CommonModule } from '@angular/common';
import { MateFunRoutingModule } from './matefun-routing.module';
import { CodemirrorModule } from 'ng2-codemirror';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificacionModule } from '../../notificacion/notificacion.module'; 
@NgModule({
    imports: [
    CommonModule, 
    FormsModule, 
    CanvasModule, 
    NotificacionModule,
    MateFunRoutingModule,
    CodemirrorModule,
    NgbModule,    
    BootstrapModalModule
    ],      
    entryComponents: [
        ConfirmComponent,
        SeleccionarDirectorioComp
    ],
    declarations: [MateFunComponent,ConfirmComponent,SeleccionarDirectorioComp],
    exports: [MateFunComponent]
})

export class MateFunModule { }
