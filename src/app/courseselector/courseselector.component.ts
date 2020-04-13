import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Usuario } from '../shared/objects/usuario';

@Component({
    selector: 'app-courseselector',
    templateUrl: './courseselector.component.html', //crear
    styleUrls: ['./courseselector.component.scss'] //crear

})

export class CourseSelectorComponent implements OnInit {
	usuario: Usuario;   
    cursos: object[];
    primerCurso: object;
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private sessionService: SessionService,
        private authenticationService: AuthenticationService,
        ) {
            this.usuario = Usuario.getUser();
            this.cursos = authenticationService.getTodosLosCursos();
          }

       

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/matefun';
    }


}
