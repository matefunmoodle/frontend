import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

    constructor(private authService: AuthenticationService,
                private route: ActivatedRoute,
                private router: Router,) {
        this.usuario = Usuario.getUser();
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

    esAlumno() : boolean{
        this.usuario = Usuario.getUser();
        return this.usuario.esAlumno();
    }

    esDocente() : boolean{
        this.usuario = Usuario.getUser();
        return this.usuario.esDocente();
    }

    esAdmin() : boolean{
        this.usuario = Usuario.getUser();
        return this.usuario.esAdmin();
    }

    esAdminLiceo() : boolean{
        this.usuario = Usuario.getUser();
        return this.usuario.esAdminLiceo();
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
