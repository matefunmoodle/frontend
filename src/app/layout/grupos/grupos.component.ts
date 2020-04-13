import { Component, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';
import { Archivo } from '../../shared/objects/archivo';
import { Grupo } from '../../shared/objects/grupo';
import { Usuario , MoodleCourseDTO} from '../../shared/objects/usuario';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { HaskellService } from '../../shared/services/haskell.service';
import { SessionService } from '../../shared/services/session.service';
import { DialogService } from "ng2-bootstrap-modal";
import { CalificarEntrega } from './calificarEntrega.component';
import { NotificacionService } from '../../shared/services/notificacion.service';

@Component({
	moduleId: module.id,
	selector: 'grupos',
	templateUrl: './grupos.component.html',
	styleUrls: ['./grupos.component.scss']
})

export class GruposComponent {
	
	archivos : Archivo[] = [];
	grupos : Grupo [] = [];
	grupoSeleccionado: Grupo = undefined;
	alumnoSeleccionado: Usuario = undefined;
	alumnoIndividualSeleccionado: Usuario = undefined;
	modoGrupal: boolean = true;
	archivoSeleccionado: Archivo = undefined;
	tipoArchivo: string = undefined;
	showLoadingFileIndicator: boolean = false;
	loading: boolean = false;
	idRecorridos :any = [];
	tree: any;
	filtroBusqueda: string = '';
	directorioActual:any;
	configCodeMirror = JSON.parse(localStorage.getItem('codeMirrorConfig'));
	calificando: boolean = false;
	cursosConRolDocente: MoodleCourseDTO[];
	cursoSeleccionado: MoodleCourseDTO;
	dataCorreccionAlumnosIndividual: any = undefined;
	loadingIndividual: boolean = false;

	constructor(private router: Router, private haskellService: HaskellService, private notifService: NotificacionService, private sessionService: SessionService, private dialogService:DialogService) {
		this.directorioActual = {};
		this.directorioActual.archivos = [];
		this.configCodeMirror.readOnly = true;
	}

	resetValores() {
		this.filtroBusqueda = '';
		this.modoGrupal = true;
		this.calificando = false;
		this.showLoadingFileIndicator = false;
		this.alumnoIndividualSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
		this.cursoSeleccionado = undefined;
		this.grupoSeleccionado = undefined;
	}

	recargarGrupales(idsCursosConRolDocente: Array<number>, user: Usuario){
		this.loading = true;
		this.haskellService.getAssignmentsPorGrupos(idsCursosConRolDocente).subscribe(
			(grupos: Grupo[]) => {
				this.grupos = null;
				this.grupos = grupos;
				for (const grupo of this.grupos) {
					for (const alumno of grupo.alumnos){
						alumno.archivos = grupo.archivos;
					}
				}
				user.setGruposParaCorreccion(this.grupos);
				this.loading = false;
			}, 
			(error: any) => {
				console.log(error);
				this.loading = false;
			}
		);
	}

	recargarIndividuales(idsCursosConRolDocente: Array<number>, user: Usuario){
		this.loadingIndividual = true;
		this.haskellService.getAssignmentsPorAlumnos(idsCursosConRolDocente).subscribe(
			(data: any) => {
				this.dataCorreccionAlumnosIndividual = null;
				this.dataCorreccionAlumnosIndividual = data;
				user.setAlumnosParaCorreccion(data);
				this.loadingIndividual = false;
			}, 
			(error: any) => {
				console.log(error);
				this.loadingIndividual = false;
			}
		);
	}

	refrescar() {
		const user: Usuario = Usuario.getUser();
		this.cursosConRolDocente = Usuario.getUser().getCursosConRolDocente();
		const idsCursosConRolDocente: Array<number> = this.cursosConRolDocente.map(c => c.id);
		this.resetValores();
		this.recargarGrupales(idsCursosConRolDocente, user);
		this.recargarIndividuales(idsCursosConRolDocente, user);
	}

	ngOnInit() {

		this.resetValores();

		const user: Usuario = Usuario.getUser();
		this.cursosConRolDocente = user.getCursosConRolDocente();
		const idsCursosConRolDocente: Array<number> = this.cursosConRolDocente.map(c => c.id);
		
		this.loading = true;
		if (!user.gruposParaCorreccion) {
			this.recargarGrupales(idsCursosConRolDocente, user);
		}else{
			this.grupos = user.gruposParaCorreccion;
			this.loading = false;
		}

		this.loadingIndividual = true;
		if (!user.alumnosParaCorreccion){
			this.recargarIndividuales(idsCursosConRolDocente, user);
		}else {
			this.loadingIndividual = false;
			this.dataCorreccionAlumnosIndividual = user.alumnosParaCorreccion;
		}
		
		this.print();
	}

	get filtroBusquedaArchivosIndividual() : Archivo[] {
		if (!!this.alumnoIndividualSeleccionado) {
			return this.alumnoIndividualSeleccionado.archivos.filter ( (a: Archivo) => a.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()))
		}
		return [];
	}

	get filtroBusquedaAlumnosIndividual() : Usuario[]{
		if (!!this.dataCorreccionAlumnosIndividual){
			const alumnosSinFiltrar: Usuario[] = this.dataCorreccionAlumnosIndividual[this.cursoSeleccionado.id.toString()];
			if (!!alumnosSinFiltrar)		
				return alumnosSinFiltrar.filter( (a: Usuario) => a.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) || a.apellido.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) );
		}
		return [];
	}

	get filtroBusquedaCursos() : MoodleCourseDTO[] {
		return this.cursosConRolDocente.filter ( (c:MoodleCourseDTO) => c.fullname.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) || c.shortname.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) );
	}
	
	get filtroBusquedaGrupos() : Grupo [] {
		return this.grupos.filter ( (g:Grupo) => g.grupo.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) || g.nombreCurso.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) );
	}

	get filtroBusquedaAlumnos(): Usuario[] {
		if (!!this.grupoSeleccionado && !!this.grupoSeleccionado.alumnos) {
			return this.grupoSeleccionado.alumnos.filter ( (a: Usuario) => a.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) || a.apellido.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) );
		}
		return [];
	}
	
	get filtroBusquedaArchivos() : Archivo[] {
		if (!!this.grupoSeleccionado && !!this.grupoSeleccionado.archivos) {
			return this.grupoSeleccionado.archivos.filter ( (a: Archivo) => a.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()))
		}
		return [];
	}

	convertirFecha(num: number){
		const a: Date = new Date(num * 1000);
		const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
		const year = a.getFullYear();
		const month = months[a.getMonth()];
		const date = a.getDate();
		const hour = a.getHours();
		const min = a.getMinutes();
		return date + ' ' + month + ' ' + (year<10?'0'+year:year) + ' ' + (hour<10?'0'+hour:hour) + ':' + (min<10?'0'+min:min);
	}

	seleccionarCurso(curso: MoodleCourseDTO) {
		this.filtroBusqueda = '';
		this.modoGrupal = false;
		this.cursoSeleccionado = curso;
		this.grupoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = undefined;

		this.print();
	}

	print(){
		// console.log ('ATRAS: modoGrupal , cursoSeleccionado, alumnoIndividualSeleccionado: ' , this.modoGrupal , !!this.cursoSeleccionado, !!this.alumnoIndividualSeleccionado)
	}

	seleccionarGrupo(grupo){
		this.filtroBusqueda = '';
		this.grupoSeleccionado = grupo;
		this.modoGrupal = true;
		this.alumnoIndividualSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
		this.cursoSeleccionado = undefined;
	}

	desseleccionarGrupo(){
		this.filtroBusqueda = '';
		this.grupoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
		this.cursoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = undefined;
	}

	desseleccionarCurso(){
		this.filtroBusqueda = '';
		this.cursoSeleccionado = undefined;
		this.grupoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = undefined;
		this.modoGrupal = true;
		
		let iid;
		iid = window.setTimeout(()=>{
			const element = document.getElementById("tabEi");
			if (!!element) {
				element.click();
				clearInterval(iid);
			}
		}, 20);
		
		this.print();
	}

	desseleccionarAlumnoIndividual(){
		this.filtroBusqueda = '';
		this.alumnoIndividualSeleccionado = undefined;
	}

	seleccionarAlumnoIndividual(alumno) {
		if (alumno.archivos.length==0)
			return;
		this.filtroBusqueda = '';
		this.grupoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = alumno;

		this.print();
	}

	seleccionarAlumno(alumno){
		this.filtroBusqueda = '';
		this.alumnoSeleccionado = alumno;
		this.cursoSeleccionado = undefined;
		this.archivoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = undefined;
	}

	seleccionarArchivo(archivo) {
		this.filtroBusqueda = '';
		if (archivo.contenido==null) {
			this.showLoadingFileIndicator = true;
			this.haskellService.getContenido(archivo.moodleFilePath).subscribe(
				(contenido) => {
					archivo.contenido = contenido;
					this.showLoadingFileIndicator = false;
				}, 
				(error) => {
					this.showLoadingFileIndicator = false;
					console.log(error);
				}
			);
		}
		this.archivoSeleccionado = archivo;
		this.alumnoSeleccionado = undefined;
		this.tipoArchivo = "compartido";
		this.print();
	}

	seleccionarEntrega(entrega){
		this.filtroBusqueda = '';
		this.archivoSeleccionado = entrega;
		this.alumnoSeleccionado = undefined;
		this.alumnoIndividualSeleccionado = undefined;
		this.cursoSeleccionado = undefined;
		this.tipoArchivo = "entrega";
	}

	calificarEntrega(){
		let disposable = this.dialogService.addDialog(CalificarEntrega,
			{
				cedula: JSON.parse(localStorage.currentUser).cedula+'',  
				archivo: this.archivoSeleccionado,
  				parentContext: this
  			})
		.subscribe((isConfirmed)=>{
			if(isConfirmed) { }
		});
	}

	esArchivoGrupo(){
		return  this.archivoSeleccionado &&
				this.grupoSeleccionado &&
				this.grupoSeleccionado.archivos.some(arch => arch.id == this.archivoSeleccionado.id);
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