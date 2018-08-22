import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Archivo, Evaluacion } from '../objects/archivo';
import { Grupo } from '../objects/grupo';

import { SERVER } from '../config';

import { AuthenticationService } from './authentication.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HaskellService {

  /**
   * Creates a new HaskellService with the injected Http.
   * @param {Http} http - The injected Http.
   * @constructor
   */
   constructor(private http: Http, private router: Router, private authService: AuthenticationService) {}

   getArchivos(cedula:string): Observable<Archivo[]> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     let options = new RequestOptions({ headers: headers, search: params });
     return this.http.get(SERVER+'/servicios/archivo',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   getArchivosCompartidosAlumno(cedula:string): Observable<Archivo[]> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     params.set('compartidos','true');
     let options = new RequestOptions({ headers: headers, search: params });
     return this.http.get(SERVER+'/servicios/archivo',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   crearArchivo(archivo: Archivo): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });
     return this.http.post(SERVER+'/servicios/archivo', archivo, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   editarArchivo(archivoId, archivo: Archivo): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
     let options = new RequestOptions({ headers: headers });
     return this.http.put(SERVER+'/servicios/archivo/'+archivoId, archivo, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   eliminarArchivo(archivoId): Observable<Response> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });
     return this.http.delete(SERVER+'/servicios/archivo/'+archivoId, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   getCopiaArchivoCompartidoGrupo(cedula, archivoId): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     let options = new RequestOptions({ headers: headers, search: params });
     return this.http.get(SERVER+'/servicios/archivo/compartido/'+archivoId, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   compartirArchivoGrupo(grupo,archivoId): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });
     var archId = {
       id:archivoId
     }
     return this.http.post(SERVER+'/servicios/grupo/'+grupo.liceoId+'/'+grupo.anio+'/'+grupo.grado+'/'+grupo.grupo+'/archivo', archId, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   calificarArchivo(archivoId, evaluacion): Observable<Evaluacion> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });
     return this.http.post(SERVER+'/servicios/archivo/'+archivoId+'/evaluacion', evaluacion, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }


   getGrupos(cedula:string): Observable<Grupo[]> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     let options = new RequestOptions({ headers: headers, search: params });
     return this.http.get(SERVER+'/servicios/grupo',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }
   
  /**
    * Handle HTTP error
    */
    private handleError (error: any) {
      if(error.status == 401){
        this.router.navigate(['/login']);
      }
      // In a real world app, we might use a remote logging infrastructure
      // We'd also dig deeper into the error to get a better message
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
      return Observable.throw(errMsg);
    }
  }
