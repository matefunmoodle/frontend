import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { SessionService } from '../../services/session.service';
import { GHCIService } from '../../services/ghci.service';
import { Usuario } from '../../objects/usuario';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    usuario: Usuario;
    constructor(
        private authService: AuthenticationService, 
        private router : Router, 
        private sessionService : SessionService,
        private ghciService : GHCIService) {
        this.usuario = authService.getUser();
    }
    ngOnInit() {}

    toggleSidebar(event) {
        event.stopPropagation();
        const dom: any = document.querySelector('body');
        dom.classList.toggle('push-right');
    }
    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    logout(){
        this.sessionService.reset();
        this.ghciService.desconectarWS();
        this.router.navigate(['/login']);
    }
}
