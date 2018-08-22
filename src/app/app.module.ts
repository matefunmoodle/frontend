import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { SessionService } from './shared/services/session.service';
import { NotificacionService } from './shared/services/notificacion.service';
import {NotificacionModule} from './notificacion/notificacion.module'
@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        NotificacionModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule
    ],
    providers: [AuthGuard, SessionService,NotificacionService],
    bootstrap: [AppComponent]
})
export class AppModule { }
