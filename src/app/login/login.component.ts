import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { AuthenticationService } from '../shared/services/authentication.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']

})

export class LoginComponent implements OnInit {
	model: any = {};
    loading = false;
    error = false;
    errorText = "";
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private sessionService: SessionService,
        private authenticationService: AuthenticationService,
        ) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/matefun';
    }

    login() {
    	// this.router.navigate([this.returnUrl]);
        this.loading = true;

        var that = this;
        this.authenticationService.login(this.model.cedula, this.model.password)
            .subscribe(
                data => {
                    //resetSession = true;
                    this.router.navigate([this.returnUrl]);
                    that.sessionService.reset();
                },
                error => {
                    this.loading = false;
                    this.error = true;
                    this.errorText = error.text();
                });
    }

    invitado(){
        this.loading = true;
        this.authenticationService.login("invitado", "invitado")
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                    this.sessionService.reset();
                },
                error => {
                    this.loading = false;
                });
    }

}
