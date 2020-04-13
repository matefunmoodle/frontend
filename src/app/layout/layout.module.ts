import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CalificarEntrega } from './grupos/calificarEntrega.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent, SidebarComponent } from '../shared';
import { AuthenticationService } from '../shared/services/authentication.service';
import { HaskellService } from '../shared/services/haskell.service';
import { CodemirrorModule } from 'ng2-codemirror';
import { NotificacionModule } from '../notificacion/notificacion.module'; 

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule.forRoot(),
        LayoutRoutingModule,
        CodemirrorModule,
        NotificacionModule
    ],
    declarations: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        CalificarEntrega
    ],
    entryComponents: [CalificarEntrega],
    providers: [AuthenticationService, HaskellService]
})
export class LayoutModule { }
