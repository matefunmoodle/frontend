import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Usuario, Configuracion } from '../objects/usuario';

import { AuthenticationService } from './authentication.service';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

import { SERVER } from '../config';

@Injectable()
export class UsuarioService {
    constructor(private http: Http, private router: Router, private authService: AuthenticationService) {}

    actualizarConfiguracion(cedula: string, config: Configuracion) {
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
        let options = new RequestOptions({ headers: headers });
        return this.http.put(SERVER + '/servicios/usuario/' + cedula + "/configuracion", config, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        let body = res.json();
        return body || [];
    }

    private handleError(error: any) {
        if(error.status == 401){
            this.router.navigate(['/login']);
        }
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
