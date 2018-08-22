import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArchivosComponent } from './archivos.component';
import { CommonModule } from '@angular/common';
import { ArchivosRoutingModule } from './archivos-routing.module';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { ConfirmComponent } from '../../shared/modal/confirm.component'; 
import { NuevoArchivo } from './nuevoArchivo.component';
import { VerCalificacionComponent } from './verCalificacion.component';
import { CompartirArchivoComponent } from './compartirArchivo.component';
import { SeleccionarDirectorioMove } from './seleccionarDirectorio.component';
import { ConfirmarEliminar } from './confirmarEliminar.component';
import { DialogService } from "ng2-bootstrap-modal";
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodemirrorModule } from 'ng2-codemirror';
import { NotificacionModule } from '../../notificacion/notificacion.module'; 

@NgModule({
    imports: [CommonModule, ArchivosRoutingModule, FormsModule,BootstrapModalModule, NgbModule, CodemirrorModule,NotificacionModule],
    declarations: [ArchivosComponent, FilterPipe,NuevoArchivo, VerCalificacionComponent, ConfirmComponent, CompartirArchivoComponent,ConfirmarEliminar, SeleccionarDirectorioMove],
    entryComponents: [
        NuevoArchivo, 
        VerCalificacionComponent,
        ConfirmComponent,
        CompartirArchivoComponent,
        ConfirmarEliminar,
        SeleccionarDirectorioMove
    ],
    exports: [ArchivosComponent]
})

export class ArchivosModule { }
