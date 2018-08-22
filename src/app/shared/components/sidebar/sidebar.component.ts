import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';

import { AuthenticationService } from '../../services/authentication.service';
import { Usuario } from '../../objects/usuario';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    isActive = false;
    showMenu = '';

    usuario: Usuario;

    constructor(private authService: AuthenticationService) {
        this.usuario = authService.getUser();
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('push-right');
    }

    esAlumno(){
        return this.usuario.tipo == "alumno";
    }

    esDocente(){
        return this.usuario.tipo == "docente";
    }

    @ViewChild('sidebarNav') sidebarNav: ElementRef;

    @HostListener('document:click', ['$event'])
    private documentClicked(event: MouseEvent): void {

        // Nav is open
        const dom: any = document.querySelector('body');
        if(dom.classList.contains('push-right')){
            // Not clicked on self element
            if (!this.sidebarNav.nativeElement.contains(event.target)) {
                
                dom.classList.remove('push-right');
            }
        }
    }

}
