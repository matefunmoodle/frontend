import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../shared/services/session.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Services } from '../shared/services/services.service';
import { Usuario } from '../shared/objects/usuario';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']

})

export class LoginComponent implements OnInit {
	model: any = {};
    loading = false;
    showPage = true;
    error = false;
    errorText = "";
    returnUrl: string;
    loginCommands = true;
    schoolList = [];
    liceoscargados = false
    soloHayUnLiceo = false;
    errorCargaLiceo = false;
    liceoSeleccionado: any;
    cursoSeleccionado: string;
    cursosUsuario: object[];
    mensaje: string;
    matefunAdmin: string;
    mostrarSelect: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private genericServices : Services,
        private sessionService: SessionService,
        private authenticationService: AuthenticationService,
        ) { }

    ngOnInit() {
        this.mostrarSelect = true;
        this.showPage = true;
        this.loginCommands = true;
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/matefun';
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/courseselector';
       
        this.fillSelect()
        
    }

    cedulaChange(event){
        if (!this.errorCargaLiceo){
            this.mostrarSelect = (event!=this.matefunAdmin)
            if (!this.mostrarSelect){
                this.liceoSeleccionado = '1'
                this.mensaje = 'ADMIN MATEFUN'
            }else{
                //this.liceoSeleccionado = undefined
                this.mensaje = undefined
            }
        }
    }


    async fillSelect(){
        await this.authenticationService.getAllSchools().subscribe(
            data => {
                
                this.schoolList = data;

                //admin
                this.genericServices.GET( '/servicios/usuario/getMatefunAdmin', [] , true ).subscribe(
                    data => {
                        this.matefunAdmin = data;
                        if (!this.matefunAdmin){
                            this.mostrarSelect = false;
                            this.errorCargaLiceo = true;
                            this.mensaje = 'Error en la carga de liceos'
                        }else{
                            this.soloHayUnLiceo = (this.schoolList.length==1)
                            if (this.schoolList.length==0) {
                                this.mensaje = 'No hay liceos cargados'
                                this.errorCargaLiceo = true;
                            }else if (this.soloHayUnLiceo){
                                
                                this.liceoSeleccionado = this.schoolList[0].liceoid;
                                this.errorCargaLiceo = false;
                            }else{
                                this.errorCargaLiceo = false;
                            }
                            this.liceoscargados = true
                        }
                        
                    },
                    error => { 
                        this.mostrarSelect = false;
                        this.errorCargaLiceo = true;
                        this.mensaje = 'Error en la carga de liceos'
                    }
                );



            },
            error => {
                this.mensaje = 'Error al cargar los liceos'
                this.errorCargaLiceo = true;
                this.liceoscargados = true;
            }
        );
    }

    login() {
        this.loading = true;

        if (this.matefunAdmin !== this.model.cedula && !this.liceoSeleccionado){
            this.loading = false;
            this.error = true;
            this.errorText = 'Debe seleccionar un liceo'
            return;
        }

        if (!this.model.cedula){
            this.loading = false;
            this.error = true;
            this.errorText = 'Debe introducir cedula'
            return;
        }

        if (!this.model.password){
            this.loading = false;
            this.error = true;
            this.errorText = 'Debe introducir contrasena'
            return;
        }



        var that = this;
        this.authenticationService.login(this.model.cedula, this.model.password, this.liceoSeleccionado)
            .subscribe(
                data => {
                    that.sessionService.reset();
                    this.returnUrl = '/matefun';
                    
                    const user: Usuario = Usuario.getUser();
                    if ( !user.esAdmin() && !user.esAdminLiceo() ){
                        this.authenticationService.getLoginAdditionalInformation().subscribe(
                            data => { }, error => { }
                        );
                    }
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.loading = false;
                    this.error = true;
                    this.errorText = error.text();
                });
    }

    invitado(){
        this.loading = true;
        this.authenticationService.login("invitado", "invitado","")
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                    this.sessionService.reset();
                },
                error => {
                    this.loading = false;
                });
    }

    seleccionar() {

        var selectedJson = null;
        for (var i=0 ; i<this.cursosUsuario.length ; i++){
            if (this.cursosUsuario[i]['selectId'] == this.cursoSeleccionado )
                selectedJson = this.cursosUsuario[i];
        }

        if (selectedJson!=null){
            var that = this;
            this.authenticationService.selectUserCourseRole(selectedJson['roleId'], selectedJson['courseId']).subscribe(
                data => {
                    this.returnUrl = '/matefun';
                    this.router.navigate([this.returnUrl]);
                },
                error => { }
            );
        }            
    }


}
