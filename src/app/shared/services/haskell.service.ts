import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Archivo, Evaluacion } from '../objects/archivo';
import { Assignment } from '../objects/assignment';
import { SimplePostResultDTO } from '../objects/SimplePostResultDTO';
import { Grupo } from '../objects/grupo';
import { Usuario } from '../objects/usuario';
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
     this.printEnConsola('getArchivos options: ' , options.search)
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.getArchivos', '\n',
                 'cedula: ', cedula, '\n',
                 'GET ', SERVER+'/servicios/archivo', '\n',
                 '___________________________')
     return this.http.get(SERVER+'/servicios/archivo',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

    ///cursos
    getArchivosDeCursos(cedula:string): Observable<Archivo[]> {
      let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
      let params: URLSearchParams = new URLSearchParams();
      params.set('cedula', cedula);
      let options = new RequestOptions({ headers: headers, search: params });     
      this.printEnConsola('getArchivosDeCursos options: ' , options.search)
      this.printEnConsola('--------------------', '\n',
                  'HaskellService.getArchivosDeCursos', '\n',
                  'cedula: ', cedula, '\n',
                  'GET ', SERVER+'/servicios/archivo/cursos', '\n',
                  '___________________________')
      return this.http.get(SERVER+'/servicios/archivo/cursos',options)
      .map((res: Response) => res.json())
      .catch(this.handleError);
    }




   getDirectoryContents( moodleFilePath:string, compartido: Boolean = false): Observable<Archivo[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken() });
    let params: URLSearchParams = new URLSearchParams();
    params.set('filepath', moodleFilePath);
    params.set('compartido', compartido ? 'true' : 'false');
    let options = new RequestOptions({ headers: headers, search: params });     
    this.printEnConsola('getDirectoryContents options: ' , options.search)
    this.printEnConsola('--------------------', '\n',
                'HaskellService.getDirectoryContents', '\n',
                'filepath: ', moodleFilePath, '\n',
                'compartido: ', compartido, '\n',
                'GET ', SERVER+'/servicios/archivo/contenido/directorio', '\n',
                '___________________________')
    return this.http.get(SERVER+'/servicios/archivo/contenido/directorio',options)
    .map((res: Response) => res.json())
    .catch(this.handleError);
  }

   getContenido(moodleFilePath:string): Observable<Archivo[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
    let params: URLSearchParams = new URLSearchParams();
    params.set('moodleFilePath', moodleFilePath);
    let options = new RequestOptions({ headers: headers, search: params });     
    this.printEnConsola('getContenido options: ' , options.search)
    this.printEnConsola('--------------------', '\n',
                'HaskellService.getContenido', '\n',
                'moodleFilePath: ', moodleFilePath, '\n',
                'GET ', SERVER+'/servicios/archivo/contenido', '\n',
                '___________________________')
    return this.http.get(SERVER+'/servicios/archivo/contenido',options)
    .map((res: Response) => res.text())
    .catch(this.handleError);
  }

   getArchivosCompartidosAlumno(cedula:string): Observable<Archivo[]> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     params.set('compartidos','true');
     let options = new RequestOptions({ headers: headers, search: params });
     this.printEnConsola('--------------------', '\n',
                 '  ', '\n',
                 'cedula: ', cedula, '\n',
                 'compartidos: ', true, '\n',
                 'GET ', SERVER+'/servicios/archivo', '\n',
                 '___________________________')
     return this.http.get(SERVER+'/servicios/archivo',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   crearArchivo(archivo: Archivo): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });     
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.crearArchivo', '\n',
                 'archivo: ', archivo, '\n',
                 'POST ', SERVER+'/servicios/archivo', '\n',
                 '___________________________')
     return this.http.post(SERVER+'/servicios/archivo', archivo, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   editarArchivo(archivoId, archivo: Archivo): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
     let options = new RequestOptions({ headers: headers });
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.editarArchivo', '\n',
                 'archivoId: ', archivoId, '\n',
                 'archivo: ', archivo, '\n',
                 'PUT ', SERVER+'/servicios/archivo/'+archivoId, '\n',
                 '___________________________')
     return this.http.put(SERVER+'/servicios/archivo/'+archivoId, archivo, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

   eliminarArchivo(archivoId): Observable<Response> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });     
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.eliminarArchivo', '\n',
                 'archivoId: ', archivoId, '\n',
                 'DELETE ', SERVER+'/servicios/archivo/'+archivoId, '\n',
                 '___________________________')
     return this.http.delete(SERVER+'/servicios/archivo/'+archivoId, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }

  getCourseGroupsAndMembers(courseId: number) {
    
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
    let params: URLSearchParams = new URLSearchParams();
    let options = new RequestOptions({ headers: headers, search: params });     
    this.printEnConsola('getCourseGroupsAndMembers options: ' , options.search)
    this.printEnConsola('--------------------', '\n',
                'HaskellService.getCourseGroupsAndMembers', '\n',
                'GET ', SERVER+'/servicios/grupo/members/' + courseId, '\n',
                '___________________________');
    
    this.printEnConsola ('ejecuta con: ' , courseId);
    return this.http.get(SERVER+'/servicios/grupo/members/' + courseId, options).toPromise()
    .then((res: Response) => { 
                                this.printEnConsola ('termina OK con: ' , courseId);
                                return res.json();
                              })
    .catch( (err) => {
                        this.printEnConsola ('termina ERR con: ' , courseId);
                        this.handleError(err);
                     } );
  }

   getCopiaArchivoCompartidoGrupo(cedula, archivoId): Observable<Archivo> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cedula', cedula);
     let options = new RequestOptions({ headers: headers, search: params });

     this.printEnConsola('--------------------', '\n',
                 'HaskellService.getCopiaArchivoCompartidoGrupo', '\n',
                 'cedula: ', cedula, '\n',
                 'archivoId: ', archivoId, '\n',
                 'GET ', SERVER+'/servicios/archivo/compartido/'+archivoId , '\n',
                 '___________________________')

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
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.compartirArchivoGrupo', '\n',
                 'grupo: ', grupo, '\n',
                 'archivoId: ', archivoId, '\n',
                 'POST ', SERVER+'/servicios/grupo/'+grupo.liceoId+'/'+grupo.anio+'/'+grupo.grado+'/'+grupo.grupo+'/archivo' , '\n',
                 '___________________________')
     return this.http.post(SERVER+'/servicios/grupo/'+grupo.liceoId+'/'+grupo.anio+'/'+grupo.grado+'/'+grupo.grupo+'/archivo', archId, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }


   entregarArchivoParaEvaluacion(assignmentId: number, archivo: Archivo): Observable<SimplePostResultDTO> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken() });
    let options = new RequestOptions({ headers: headers });
    
    this.printEnConsola('--------------------', '\n',
                'HaskellService.entregarArchivoMoodle', '\n',
                'assignmentId: ', assignmentId, '\n',
                'archivo: ', archivo, '\n',
                'POST ', SERVER+'/servicios/evaluaciones/entregaarchivo/' + assignmentId , '\n',
                '___________________________')
    return this.http.post(SERVER + '/servicios/evaluaciones/entregaarchivo/' + assignmentId, archivo, options)
    .map((res: Response) => res.json())
    .catch(this.handleError);
  }


  getAllAssignments(): Observable<Assignment[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()});
    let options = new RequestOptions({ headers: headers });     
    this.printEnConsola('getAllAssignments options: ' , options)
    this.printEnConsola('--------------------', '\n',
                'HaskellService.getAllAssignments', '\n',
                'GET ', SERVER+'/servicios/evaluaciones/assignments/all', '\n',
                '___________________________')
    return this.http.get(SERVER+'/servicios/evaluaciones/assignments/all',options)
    .map((res: Response) => res.json() as Assignment[] )
    .catch(this.handleError);
  }


   calificarArchivo(archivo: Archivo): Observable<Evaluacion> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer '+this.authService.getToken()  });
     let options = new RequestOptions({ headers: headers });
     
     this.printEnConsola('--------------------', '\n',
                 'HaskellService.calificarArchivo', '\n',
                 'evaluacion: ', archivo.evaluacion, '\n',
                 'archivo: ', archivo, '\n',
                 'POST ', SERVER+'/servicios/evaluaciones/corregir' , '\n',
                 '___________________________')
     return this.http.post(SERVER+'/servicios/evaluaciones/corregir', archivo, options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }
   
   getSubmissionStatus(assignid: number, userid?: number, groupid?: number) {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken() });
    let params: URLSearchParams = new URLSearchParams();
    params.set('assignid', assignid + '');
    if (!!userid)
      params.set('userid', userid + '');
    if (!!groupid)
      params.set('groupid', groupid + '');
    
    const options = new RequestOptions({ headers: headers, search: params });
    return this.http.get(SERVER+'/servicios/evaluaciones/getSubmissionStatus', options)
        .map((res: Response) => res.json())
        .catch(this.handleError);
}


   compartirArchivo(dataShareFile : object): Observable<any[]> {
      let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken() });
      let options = new RequestOptions({ headers: headers });
      this.printEnConsola('--------------------', '\n',
                  'HaskellService.compartirArchivo', '\n',
                  'dataShareFile: ', dataShareFile, '\n',
                  'POST ', SERVER+'/servicios/archivo', '\n',
                  '___________________________')
      return this.http.post(SERVER+'/servicios/archivo/compartir', dataShareFile, options)
      .map((res: Response) => res.json())
      .catch(this.handleError);
   }


   getAssignmentsPorGrupos(cursosConRolDocente:Array<number>): Observable<Grupo[]> {
     let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken() });
     let params: URLSearchParams = new URLSearchParams();
     params.set('cursos', cursosConRolDocente.toString());
     let options = new RequestOptions({ headers: headers, search: params });
     
     return this.http.get(SERVER+'/servicios/evaluaciones/grupal',options)
     .map((res: Response) => res.json())
     .catch(this.handleError);
   }


   
   getAssignmentsPorAlumnos(cursosConRolDocente:Array<number>): Observable<any> {
    
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'Bearer ' + this.authService.getToken() });
    let params: URLSearchParams = new URLSearchParams();
    params.set('cursos', cursosConRolDocente.toString());
    let options = new RequestOptions({ headers: headers, search: params });
    
    return this.http.get(SERVER+'/servicios/evaluaciones/individual',options)
    .map((res: Response) => res.json())
    .catch(this.handleError);
  }

   private printEnConsola(message?: any, ...optionalParams: any[]){
      //console.log (message, optionalParams);
   }
   
  /**
    * Handle HTTP error
    */
    private handleError (error: any) {
      console.log('error: ' , error)
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
