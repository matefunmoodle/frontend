import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Archivo } from '../../shared/objects/archivo';
import { Grupo } from '../../shared/objects/grupo';
import { Usuario } from '../../shared/objects/usuario';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { HaskellService } from '../../shared/services/haskell.service';
import { SessionService } from '../../shared/services/session.service';
import { DialogService } from "ng2-bootstrap-modal";
import { CalificarEntrega } from './calificarEntrega.component';
import { NgbPopoverConfig, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import { NotificacionService } from '../../shared/services/notificacion.service';



@Component({
	moduleId: module.id,
	selector: 'grupos',
	templateUrl: './grupos.component.html'
})

export class GruposComponent {
	archivos : Archivo[] = [];
	grupos : Grupo [] = [];
	grupoSeleccionado: Grupo = undefined;
	
	alumnoSeleccionado: Usuario = undefined;

	archivoSeleccionado: Archivo = undefined;

	tipoArchivo: string = undefined;

	loading: boolean = false;
	idRecorridos :any = [];
	tree: any;
	directorioActual:any;
	configCodeMirror = JSON.parse(sessionStorage.getItem('codeMirrorConfig'));

	constructor(
		private router: Router,
		private authService: AuthenticationService,
		private haskellService: HaskellService,
		private notifService: NotificacionService,
		private sessionService: SessionService,
		private dialogService:DialogService
		){
		this.directorioActual = {};
		this.directorioActual.archivos = [];
		this.configCodeMirror.readOnly = true;
	}

	ngOnInit(){
		let cedula = this.authService.getUser().cedula;
		this.loading = true;
		this.haskellService.getGrupos(cedula)
		.subscribe(
			grupos => {
				this.grupos = grupos;
				this.ordenarGrupos();
				this.loading = false;
			}, 
			error => console.log(error) 
			);
	}

	//ordenar archivos del grupo seleccionado.
	ordenarAlph(a, b){
   		if(a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
     	if(a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
     	return 0;
	}

	ordenarArchivos(){
		this.grupoSeleccionado.archivos = this.grupoSeleccionado.archivos.sort(this.ordenarAlph);
	}

	//ordeno los archivos del alumno (los archivos entregados.)
	ordenarArchivosAlumno(){
		if(this.archivoSeleccionado.archivos){
			this.archivoSeleccionado.archivos = this.archivoSeleccionado.archivos.sort(this.ordenarAlph);
		}
	}

	//ordenar grupos
	ordenarGrupoF(a,b){
		if(a.grado>b.grado) return 1;
		if(a.grado<b.grado) return -1;
		if(a.grupo.toLowerCase()>b.grupo.toLowerCase()) return 1;
		if(a.grupo.toLowerCase()<b.grupo.toLowerCase()) return -1;
		return 0;
	}

	ordenarGrupos(){
		this.grupos = this.grupos.sort(this.ordenarGrupoF);
	}

	//ordenar alumnos
	ordenarAlumnosF(a,b){
		if(a.apellido.toLowerCase()>b.apellido.toLowerCase()) return  1;
		if(a.apellido.toLowerCase()<b.apellido.toLowerCase()) return -1;
		return 0;
	}

	ordenarAlumnos(){
		this.grupoSeleccionado.alumnos = this.grupoSeleccionado.alumnos.sort(this.ordenarAlumnosF);
	}

	seleccionarGrupo(grupo){
		this.grupoSeleccionado = grupo;
		this.ordenarAlumnos();
		this.ordenarArchivos();
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
	}

	desseleccionarGrupo(){
		this.grupoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
	}

	seleccionarAlumno(alumno){
		this.alumnoSeleccionado = alumno;
		this.ordenarArchivosAlumno();
		this.archivoSeleccionado = undefined;
	}

	seleccionarArchivo(archivo){
		this.archivoSeleccionado = archivo;
		this.alumnoSeleccionado = undefined;
		this.tipoArchivo = "compartido";
	}

	seleccionarEntrega(entrega){
		this.archivoSeleccionado = entrega;
		this.alumnoSeleccionado = undefined;
		this.tipoArchivo = "entrega";
	}

	calificarEntrega(){
		let disposable = this.dialogService.addDialog(CalificarEntrega,
			{
				cedula: JSON.parse(sessionStorage.currentUser).cedula+'',  
				archivo: this.archivoSeleccionado,
  				parentContext: this
  			})
		.subscribe((isConfirmed)=>{
			if(isConfirmed) { 
				//codeMirrorRef.options.readOnly = false;
				//componentRef.editDialogFired = true;
			}
		});
	}

	esArchivoGrupo(){
		if(this.archivoSeleccionado && this.grupoSeleccionado && this.grupoSeleccionado.archivos.some(arch => arch.id == this.archivoSeleccionado.id)){
			return true;
		}else{
			return false;
		}
	}

	cargarArchivoCompartido(){
		if(this.archivoSeleccionado){
			if(this.archivoSeleccionado.directorio){
				this.notifService.warning('No se seleccionó ningún archivo',false);
			}else{
				this.sessionService.setArchivo(this.archivoSeleccionado);
				this.router.navigate(['/matefun']);
			}
		}else{
			this.notifService.warning("Archivo no seleccionado");
		}
	}

}