import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GHCIService } from '../shared/services/ghci.service';
import { NotificacionService } from '../shared/services/notificacion.service';
@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    providers: [GHCIService]
})
export class LayoutComponent implements OnInit {
    constructor(public router: Router) { }
    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/login']);
        }
    }
}
