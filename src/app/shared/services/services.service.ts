import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { AuthenticationService } from './authentication.service';
import { SERVER } from '../config'; 

@Injectable()
export class Services {
    
    constructor( private http: Http , private authService: AuthenticationService) { }

    POST ( endpoint: string, requestObject: any ) {
      
      const token = this.authService.getToken();
      const postHeaders =  new Headers({
                                          'Content-Type' : 'application/json',
                                          'Authorization' : 'Bearer ' + token
                                       });
      const options = new RequestOptions({headers: postHeaders });
      const URL = SERVER + endpoint

      return this.http.post(URL, JSON.stringify(requestObject), options )
          .map ((res: Response) => res.json())
          .catch (this.handleError);
    }

   DELETE (endpoint: string, id : any) : Observable<Response> {
      const token = this.authService.getToken();
      const deleteHeaders =  new Headers({ 'Content-Type' : 'application/json', 'Authorization' : 'Bearer ' + token });
      const options = new RequestOptions({ headers: deleteHeaders });
      const URL = SERVER + endpoint + '/' + id
      return this.http.delete( URL , options )
      .map((res: Response) => res.json())
      .catch(this.handleError);
   }

   GET (endpoint: string, paramsin: Array<any> = [] , isString: boolean = false) {  
      
      const token = this.authService.getToken();
      const getHeaders =  new Headers({ 'Content-Type' : 'application/json', 'Authorization' : 'Bearer ' + token });
      const URL = SERVER + endpoint

      let requestOptionsJson = {headers: getHeaders}
      if (paramsin.length != 0){
         let params: URLSearchParams = new URLSearchParams();
         for (let i=0 ; i<paramsin.length ; i++ ) {
            params.set(paramsin[i].key, paramsin[i].value);
         }
         requestOptionsJson['search'] = params;
      }

      const options = new RequestOptions(requestOptionsJson);
      return this.http.get(URL, options)
         .map((res: Response) => {
            return isString ? res.text() : res.json();
         }).catch(
            this.handleError
         );
  }

   private handleError (error: any) {
      console.log(error.status)
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
      return Observable.throw(errMsg);
   }

}