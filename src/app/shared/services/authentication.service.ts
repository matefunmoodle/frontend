import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { hash } from '../utils/sha1'
import 'rxjs/add/operator/map'
import { SERVER } from '../config'; 
import { Usuario } from '../objects/usuario';
import { Configuracion } from '../objects/usuario';

@Injectable()
export class AuthenticationService {
    constructor(private http: Http) { }

    getAllSchools(){
        let headers = new Headers( {'Content-Type': 'application/json' , 'Authorization':'Bearer '+this.getToken() } );
        let options = new RequestOptions({ headers: headers });
         return this.http.get( SERVER +  '/servicios/liceo/getAllLiceos' , options)
             .map((res: Response) => {
                 return res.json();
             }).catch(
                 this.handleError
             );
    }

    login( cedula: string, password: string, liceoSeleccionado: string ) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        
        return this.http.post(SERVER+'/servicios/login', JSON.stringify({ "cedula": cedula, "password": password, "liceo": liceoSeleccionado }),options)
            .map((response: Response) => {
                localStorage.setItem('currentUser', JSON.stringify(response.json()));
                console.log('Login ok, usuario: ' , response.json() );
            });
    }

    getLoginAdditionalInformation() {
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+ this.getToken()  });
        let options = new RequestOptions({ headers: headers });
        return this.http.post( SERVER+'/servicios/login/loginAdditionalInfo', JSON.stringify({}) , options )
            .map((response: Response) => {
                localStorage.setItem('currentUser', JSON.stringify(response.json()));                
                console.log('getLoginAdditionalInformation Usuario: ' , JSON.parse(localStorage.getItem('currentUser')));
            });
    }

    selectUserCourseRole(roleId: string, courseId: string){
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.getToken() });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(SERVER+'/servicios/login/selectUserCourseRole', JSON.stringify({ "token": this.getToken(), "roleId": roleId, "courseId": courseId }) , options )
            .map((response: Response) => {
                let user = response.json();
                console.log ('selectUserCourseRole -> setItem: ' , user)
                localStorage.setItem('selectUserCourseRole: currentUser', JSON.stringify(user));
       });
    }


    addNewSchool(nombre: string, moodleuri: string){
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.getToken() });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(SERVER+'/servicios/liceo/addNewSchool', JSON.stringify({ "token": this.getToken(), "nombre": nombre, "moodleuri": moodleuri }) , options )
            .map((response: Response) => {
                let respJson = response.json();
       });
    }

    getUserConfig() : Configuracion{
        return Usuario.getUser().configuracion;
    }

    getToken() : string{
        var currentUser = Usuario.getUser();
        return currentUser? currentUser.token: undefined;
    }

    setUserConfig(config){
        var user = JSON.parse(localStorage.getItem('currentUser'));
        user.configuracion = config;
        console.log ('setUserConfig -> setItem: ' , user)
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    getTodosLosCursos(){
        return Usuario.getUser().todosLosCursos;
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }


    private handleError (error: any) {
      console.log(error.status)
      // In a real world app, we might use a remote logging infrastructure
      // We'd also dig deeper into the error to get a better message
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
      return Observable.throw(errMsg);
    }

}