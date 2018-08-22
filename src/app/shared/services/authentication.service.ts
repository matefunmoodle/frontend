import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { hash } from '../utils/sha1'
import { Usuario } from '../objects/usuario';
import 'rxjs/add/operator/map'
import { SERVER } from '../config'; 

@Injectable()
export class AuthenticationService {
    constructor(private http: Http) { }

    login(cedula: string, password: string) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(SERVER+'/servicios/login', JSON.stringify({ "cedula": cedula, "password": password }),options)
            .map((response: Response) => {
                let user = response.json();
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            });
    }

    getUser():Usuario{
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }

    getUserConfig(){
         return JSON.parse(sessionStorage.getItem('currentUser')).configuracion;;
    }

    getToken(){
        var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        return currentUser? currentUser.token: undefined;
    }

    setUserConfig(config){
        var user = JSON.parse(sessionStorage.getItem('currentUser'));
        user.configuracion = config;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }


    logout() {
        // remove user from local storage to log user out
        sessionStorage.removeItem('currentUser');
    }
}