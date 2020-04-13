import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { hash } from '../utils/sha1'
import { AuthenticationService } from './authentication.service';
import 'rxjs/add/operator/map'
import { SERVER } from '../config'; 

@Injectable()
export class MoodleService {
    
    constructor(private http: Http, private authService: AuthenticationService) { }

    addNewSchool(nombre: string, moodleuri: string, servicename: string, servicetoken: string){
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+ this.authService.getToken()  });
        let options = new RequestOptions({ headers: headers });
        let data = { "liceoid": '' ,
                     "nombre": nombre,
                     "moodleuri": moodleuri,
                     "servicename" : servicename,
                     "servicetoken" : servicetoken
                   }

        return this.http.post( SERVER + '/servicios/liceo/addNewSchool', JSON.stringify(data) , options )
            .map((response: Response) => { });
    }

    deleteSchool(liceoId: string){
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+ this.authService.getToken()});
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(SERVER+'/servicios/liceo/'+liceoId , options )
            .map((response: Response) => { });
    }

    updateSchool(liceoId: string, liceoName: string, liceoMoodleUri: string, servicename : string, servicetoken: string, admins: string[] ){
        let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken()});
        let options = new RequestOptions({ headers: headers });
        
        let data = { "liceoid": liceoId,
                     "nombre": liceoName,
                     "moodleuri": liceoMoodleUri,
                     "servicename": servicename,
                     "servicetoken": servicetoken,
                     "adminnames" : admins
                    }
        
        return this.http.post( SERVER + '/servicios/liceo/updateSchool', JSON.stringify(data) , options )
            .map((response: Response) => { });
    }

}