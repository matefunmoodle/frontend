import { Component,ViewChild } from '@angular/core';
import { Archivo } from '../../shared/objects/archivo';
import { Usuario } from '../../shared/objects/usuario';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { HaskellService } from '../../shared/services/haskell.service';
import { SessionService } from '../../shared/services/session.service';
import { NotificacionService } from '../../shared/services/notificacion.service';
import { Router } from '@angular/router';
import { NuevoArchivo } from './nuevoArchivo.component';
import { VerCalificacionComponent } from './verCalificacion.component';
import { CompartirArchivoComponent } from './compartirArchivo.component';
import { ConfirmarEliminar } from './confirmarEliminar.component';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../../shared/modal/confirm.component';
import { ConfirmEntregaComponent } from '../../shared/modal/confirmentrega.component';
import { ModalCompartirArchivoComponent } from '../../shared/modal/modalcompartirarchivocomponent.component';
import { SeleccionarDirectorioMove } from './seleccionarDirectorio.component';
import { CodemirrorComponent } from 'ng2-codemirror';
import { NgbPopoverConfig, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import { Services } from '../../shared/services/services.service';
import { Assignment } from '../../shared/objects/assignment';
//TODO importar de otro lado
import { CalificarEntrega } from './../grupos/calificarEntrega.component';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/addon/display/panel';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/mode/markdown/markdown';
import * as _ from "lodash";

@Component({
	moduleId: module.id,
	selector: 'archivos',
	templateUrl: './archivos.component.html',
	styleUrls: ['./archivos.component.scss']
})

export class ArchivosComponent {
	soloMatefun: boolean = false;
	soloMfTexto: string = '.mf';
	soloMfTooltip: string = 'Mostrar solo archivos matefun';
	archivos : Archivo[] = [];
	archivosCompartidos: Archivo[] = [];
	archivosCompartidosSinDuplicados: Archivo [] = [];
	archivoSeleccionado: Archivo;
	loading: boolean = false;
	loadingCompartidos:boolean = false;
	archivoClickeado: Archivo = undefined;
	filtroNombre: string = '';
	idRecorridos :any = [];
	esAlumno :boolean;
	esDocente: boolean;
	compartiendo: boolean = false;
	creandoArchivo: boolean = false;
	showLoadingFileIndicator: boolean = false;
	tree: any;
	allAssignments: Assignment[];
	preview: string = '';
	directorioActual:any;
	directorioCompartidoActual: any
	sortFunction:any;
	coursesGroupsAndMembers;
	configCodeMirror = JSON.parse(localStorage.getItem('codeMirrorConfig')) ;
	archivosCurso: Archivo[] = [];

	get vistaDirectorioActualMisArchivos(){
		if (this.soloMatefun)
			return this.directorioActual.archivos.filter(arch => arch.nombre.toLowerCase().endsWith('.mf') );
		else
			return this.directorioActual.archivos;
	}

	constructor(
		private router: Router,
		private notifService: NotificacionService,
		private authService: AuthenticationService,
		private haskellService: HaskellService,
		private sessionService: SessionService,
		private dialogService: DialogService
		){
		this.esAlumno =  Usuario.getUser().esAlumno();
		this.esDocente =  Usuario.getUser().esDocente()
		this.coursesGroupsAndMembers = undefined;
		this.directorioActual = {};
		this.directorioActual.archivos = [];

		this.directorioCompartidoActual = {};
		this.directorioCompartidoActual.archivos = [];

		this.configCodeMirror.readOnly = true;

		//lo que muestra la vista del directorio actual
		//this.vistaDirectorioActualMisArchivos = [];

	}
	@ViewChild(CodemirrorComponent) codemirror: CodemirrorComponent;

	ngOnInit(){
		this.compartiendo = false;
		this.creandoArchivo = false;
		this.soloMatefun = false;
		this.soloMfTexto= '.mf';
		this.soloMfTooltip = 'Mostrar solo archivos matefun';
		const todosLosCursos = this.authService.getTodosLosCursos();
		Promise.all(
			todosLosCursos.map((course) => (
				this.haskellService.getCourseGroupsAndMembers(course['id'])
			))
		).then( cgm => {
			this.coursesGroupsAndMembers = cgm;
		});


		this.sortFunction = 'tipo'
		let cedula = Usuario.getUser().cedula;
		this.loading = true;
		this.haskellService.getArchivos(cedula).subscribe(
			archivos => {
				if (archivos) {
					archivos.map ((a: Archivo) => { if (!!a.directorioMatefun) a.directorioMatefun = a.padreId==-1 ? null : '/' });
				}
				this.archivos = archivos;
				this.loading = false;
				this.buildTreeFromList();

			}, 
			error => console.log(error) 
		);
			
		this.loadingCompartidos = true;
		this.haskellService.getDirectoryContents('/', true).subscribe(
			archivos => {
				if (archivos) {
					archivos.map ((a: Archivo) => { if (!!a.directorioMatefun) a.directorioMatefun = '/' });
				}
				this.archivosCompartidos = archivos;
				this.archivosCompartidosSinDuplicados = archivos.filter(arch => arch.archivoOrigenId != -1 || !archivos.some(a => a.archivoOrigenId == arch.id));
				this.loadingCompartidos = false;
				console.log ('files: ' , this.archivosCompartidosSinDuplicados)
				console.log ('filesNoDup: ' , this.archivosCompartidosSinDuplicados)
			}, 
			error => console.log(error)
		);

		this.haskellService.getArchivosDeCursos(cedula).subscribe(
			archivosCurso => {
				this.archivosCurso = archivosCurso;	
			}, 
			error => console.log(error)
		);

		this.haskellService.getAllAssignments().subscribe(
			apiassignment => {
			  this.allAssignments = apiassignment;
			}, 
			error => {
			  this.notifService.error(error);
			}
		);

	}
	ordenarMixto(){
		//1. primero las carpetas.
		this.archivosCompartidosSinDuplicados = this.archivosCompartidosSinDuplicados.sort(this.ordenarTipo);
		this.directorioActual.archivos= this.directorioActual.archivos.sort(this.ordenarTipo);

		var archs1 = this.directorioActual.archivos;
		var archs2 = this.archivosCompartidosSinDuplicados;

		var archs1_directorios = archs1.filter(
			function (a) {
				return a.directorio;
			}
		);

		var archs1_archivos =archs1.filter(
			function(a){
				return !a.directorio;
			}

		);

		var archs2_directorios = archs2.filter(
			function (a) {
				return a.directorio;
			}
		);

		var archs2_archivos =archs2.filter(
			function(a){
				return !a.directorio;
			}

		);
		//2. dentro de cada categoría ordeno alfabéticamente.

		archs1_archivos = archs1_archivos.sort(this.ordenarAlph);
		archs1_directorios = archs1_directorios.sort(this.ordenarAlph);
		archs2_archivos = archs2_archivos.sort(this.ordenarAlph);
		archs2_directorios = archs2_directorios.sort(this.ordenarAlph);

		for(var i in archs1_archivos){
			archs1_directorios.push(archs1_archivos[i])
		}
		for(var i in archs2_archivos){
			archs2_directorios.push(archs2_archivos[i])
		}

		this.directorioActual.archivos = archs1_directorios;
		this.archivosCompartidosSinDuplicados = archs2_directorios;
	}

	ordenarAlph(a,b){
		if(a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
		if(a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
		return 0;
	}
	ordenarFecha(a, b){
		if(a.fechaCreacion < b.fechaCreacion) return -1;
		if(a.fechaCreacion > b.fechaCreacion) return 1;
		return 0;
	}
	ordenarTipo(a,b){
		if(a.directorio && !b.directorio) return -1;
		if(!a.directorio && b.directorio) return 1;
		return 0;	
	}
	ordenarPorTipo(){
		this.sortFunction='tipo';
		this.ordenarArchivos();
	}
	ordenarPorFecha(){
		this.sortFunction='fecha';
		this.ordenarArchivos();
	}
	ordenarFechaCreacion(){
		this.archivosCompartidosSinDuplicados = this.archivosCompartidosSinDuplicados.sort(this.ordenarFecha);
		this.directorioActual.archivos= this.directorioActual.archivos.sort(this.ordenarFecha);
	}

	ordenarArchivos(){
		var tipo = this.sortFunction;
		if(tipo==='tipo'){
			this.ordenarMixto();	
		} else if(tipo==='fecha'){
			this.ordenarFechaCreacion();
		}
	}

	mostrarEliminarDialogo(){
		if(this.archivoSeleccionado){
			//Si el archivo es del alumno lo puedo eliminar. 
			//(No se controla por creador dado que los compartidos mantienen este atributo)
			if(this.archivos.some(arch => arch.id == this.archivoSeleccionado.id)){
				var that = this;
				let disposable = this.dialogService.addDialog(ConfirmarEliminar, {
					nombreArchivo:that.archivoSeleccionado.nombre, 
					esDirectorio:that.archivoSeleccionado.directorio,
					parentContext :that})
				.subscribe((isConfirmed)=>{

					if(isConfirmed) {


						//codeMirrorRef.options.readOnly = false;
						//componentRef.editDialogFired = true;
					}
				});
			}else{
				this.notifService.warning("Sin permisos para eliminar el archivo");
			}
		}else{
			this.notifService.warning("Archivo no seleccionado");
		}
	}
	seleccionarDirectorioAMover(){
		if(this.archivoSeleccionado){
			//Si el archivo es del alumno lo puedo eliminar. 
			//(No se controla por creador dado que los compartidos mantienen este atributo)
			if(this.archivos.some(arch => arch.id == this.archivoSeleccionado.id)){
				var that = this;
				let disposable = this.dialogService.addDialog(SeleccionarDirectorioMove, {
					archivos:that.tree,
					directorioActual:that.directorioActual,
					nombre:that.archivoSeleccionado.nombre, 
					directorio:that.archivoSeleccionado.directorio,
					parent :that})
				.subscribe((isConfirmed)=>{

					if(isConfirmed) {


					}
				});
			}else{
				this.notifService.warning("Sin permisos para mover el archivo");
			}
		}else{
			this.notifService.warning("Archivo no seleccionado");
		}
	}


	recargarArchivos(idDirectorioActual){
		console.log ('recargarArchivos, idDirectorioActual: ' , idDirectorioActual)
		let cedula = Usuario.getUser().cedula;
		this.loading = true;
		this.haskellService.getArchivos(cedula)
		.subscribe(
			archivos => {
				console.log ('Archivos Recargados: ' , archivos)
				this.archivos = archivos;
				this.loading = false;
				this.buildTreeFromList_setearDirectorioActual(idDirectorioActual);

			}, 
			error => console.log(error) 
			);
	}


	navBack(){
		var that =this;
		if(this.directorioActual.padreId!==-1) {
			var padre = this.archivos.filter(function(a){return a.id===that.directorioActual.padreId})[0];
			this.directorioActual = padre;	
		}
		this.archivoSeleccionado = undefined;
		this.preview = '';
	}
	
	setSoloLectura = function(arch: Archivo){

		this.archivoSeleccionado.editable = !this.archivoSeleccionado.editable;
		this.haskellService.editarArchivo(this.archivoSeleccionado.id,this.archivoSeleccionado)
		.subscribe(
			archivo => {
				console.log("Archivo modificado");
			}, 
			error => {
				this.notifService.error(error);
			});
		
	}
	
	soloMatefunToggle(event){
		this.soloMatefun = !this.soloMatefun;
		this.soloMfTexto = this.soloMatefun ? ' .* ' : '.mf';
		this.soloMfTooltip = this.soloMatefun ? 'Mostrar todos los archivos' : 'Mostrar solo archivos matefun';
	}

	cargarArchivo(arch: Archivo = null) {
		if (arch)
			this.archivoSeleccionado = arch;

		if(this.archivoSeleccionado){
			if(this.archivoSeleccionado.directorio){
				this.notifService.warning('No se seleccionó ningún archivo',false);
			}else{
				//Si el archivo es compartido con el grupo, editabe y no lo he editado, lo voy a buscar al servidor. 
				if(this.archivosCompartidos.some(arch => arch.id == this.archivoSeleccionado.id) && this.archivoSeleccionado.editable && this.archivoSeleccionado.archivoOrigenId == -1){
					if(this.hayArchivoMio()){
						this.seleccionarArchivoMio();
						this.sessionService.setArchivo(this.archivoSeleccionado);
						this.router.navigate(['/matefun']);
					}else{
						let cedula = Usuario.getUser().cedula;
						this.haskellService.getCopiaArchivoCompartidoGrupo(cedula,this.archivoSeleccionado.id).subscribe(
							archivo => {
								this.sessionService.setArchivo(archivo);
								this.router.navigate(['/matefun']);
							},
							error =>{
								console.log(error);
							});
					}
				}else{
					this.sessionService.setArchivo(this.archivoSeleccionado);
					this.router.navigate(['/matefun']);
				}
			}
		}else{
			this.notifService.warning("Archivo no seleccionado");
		}
	}


	mostrarModalCompartirArchivo(){
		
		let pc: any = this;
		let disposable = this.dialogService.addDialog(ModalCompartirArchivoComponent, {
			archivo: this.archivoSeleccionado,
			coursesGroupsAndMembers: this.coursesGroupsAndMembers,
			parentContext: pc}
		).subscribe((isConfirmed)=>{
			console.log ('isConfirmed: ' , isConfirmed)
		});
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

	calificarEntrega(){
		let disposable = this.dialogService.addDialog(CalificarEntrega,
		  {
			cedula: JSON.parse(localStorage.currentUser).cedula+'',  
			archivo: this.archivoSeleccionado,
			  parentContext: this
			})
		.subscribe((isConfirmed)=>{ });
	  }

	confirmarEntrega() {
		this.dialogService.addDialog(ConfirmEntregaComponent, {
			title:'Realizar entrega' , 
			confirmText: 'Entregar',
			cancelText: 'Cancelar',
			archivo: this.archivoSeleccionado,
			allAssignments: this.allAssignments,
			parent: this
		})
	}

	entregarArchivo(){
		this.archivoSeleccionado.estado = 'Entregado';
		this.haskellService.editarArchivo(this.archivoSeleccionado.id, this.archivoSeleccionado)
		.subscribe(
			archivo => {
				this.archivoSeleccionado = archivo;                                
			}, 
			error => {
				this.notifService.error(error);
			});
	}

	buildTreeFromList_setearDirectorioActual(idDirectorioActual){
		console.log ('buildTreeFromList_setearDirectorioActual: ' + idDirectorioActual)
		var archivos = this.archivos;
		this.sessionService.setArchivosList(archivos);
		var root :Archivo;
		
		for(var a in archivos){
			var arch = archivos[a];
			if(arch.padreId===-1){
				root = arch;
			} 
		}
		this.idRecorridos = [root.id];
		var archivos2 = archivos.filter(
			function(a){
				return a.id!==root.id;
			}
			);
		var directorioActual = this.archivos.filter(function(a){return a.id===idDirectorioActual})[0];
		var tree = this.buildTree(archivos2,root);
		this.tree = tree;
		this.directorioActual = directorioActual;
		this.ordenarArchivos();
		this.sessionService.setArchivosTree(tree);
	}

	buildTreeFromList (){
		
		var archivos = this.archivos;
		this.sessionService.setArchivosList(archivos);
		var root :Archivo;
		
		for(var a in archivos){
			var arch = archivos[a];
			if(arch.padreId===-1){
				root = arch;
			} 
		}
		this.idRecorridos = [root.id];
		var archivos2 = archivos.filter(
			function(a){
				return a.id!==root.id;
			}
			);
		var tree = this.buildTree(archivos2,root);
		this.tree = tree;
		this.directorioActual = tree;
		this.ordenarArchivos();
		this.sessionService.setArchivosTree(tree);
	}


	buildTree(archivos, root){
		root.archivos = this.getArchivos(root.id,archivos);
		for(var a in root.archivos){
			if(root.archivos[a].directorio && this.idRecorridos[root.archivos[a].id] === undefined){
				var id = root.archivos[a].id;
				var archivos2 = archivos.filter(function(a){return a.id!==id});
				root.archivos[a] = this.buildTree(archivos2 ,root.archivos[a]);
			}
		}
		return root;
	}

	getArchivos(id,archivos){
		return archivos.filter(
			function(a){
				return a.padreId === id;
			}
			);
	}

	cantArchivos(idPadre,archivos){
		return archivos.filter(function(a){a.padreId ===idPadre;}).length;
	}

	elem(id,archivos){
		if(archivos===[]){
			return false;
		}else {
			return archivos.filter(
				function(a){
					a.id ===id;
				}).length>0;
		}
	}

	mkdir(){
		var that = this;
		let disposable = this.dialogService.addDialog(NuevoArchivo, {
			nombre:'', 
			descripcion:'',
			esDirectorio:true,
			parentContext :that})
		.subscribe((isConfirmed)=>{

		});
	}
	mkFile(){
		console.log ('mkFile: Creando nuevo archivo')

		var that = this;
		let disposable = this.dialogService.addDialog(NuevoArchivo, {
			nombre:'', 
			descripcion:'',
			esDirectorio:false,
			parentContext :that})
		.subscribe((isConfirmed)=>{
			console.log ('mkFile: suscribe')
		});
	}


	seleccionarArchivo2 = function(arch: Archivo, contents: any) {
		if(arch.directorio){
			this.directorioActual=arch;
			this.directorioActual.archivos=contents;
		}else {
			this.sessionService.setDirectorioActual(this.directorioActual);
			this.sessionService.cargarDependencias(arch);
		}
		//this.archivoSeleccionado = arch;
		this.preview = arch.contenido;
		this.ordenarArchivos();
	}


	recargarDirectorioActual() {
		this.loading = true;
		
		_.remove(this.archivos, (arch: Archivo) => 
			this.directorioActual.archivos.some((archDA: Archivo) => 
				_.isEqualWith(arch, archDA, (a1, a2) => a1.id===a2.id))
		);

		//elimino los archivos que tiene actualmente
		this.directorioActual.archivos.splice(0,this.directorioActual.archivos.length);
		this.directorioActual.contenido = null;
		this.seleccionarArchivo(this.directorioActual);
		
	}

	seleccionarArchivo = function(arch: Archivo) {
		console.log ('seleccionarArchivo: ' , arch)
		this.archivoClickeado = arch;
		if (this.archivoSeleccionado && arch.id==this.archivoSeleccionado.id && !arch.directorio)
			return;
		this.showLoadingFileIndicator = true;
		if (this.archivoSeleccionado && !this.archivoSeleccionado.directorio) {
			this.archivoSeleccionado = undefined;
			this.preview = '';
		}
		
		//cargo el contenido del archivo en modo lazy
		if (!arch.directorio && !arch.contenido) {
			this.haskellService.getContenido( arch.moodleFilePath ).subscribe (
				contents => {
					this.showLoadingFileIndicator = false;
					arch.contenido = contents;
					this.archivoSeleccionado = arch;
					this.seleccionarArchivo2(arch);
				},
				error => {
					this.showLoadingFileIndicator = false;
					console.log(error)
				}
			);
		} else if (arch.directorio && !arch.contenido) {
			console.log ('getDirectoryContents: ' , arch)
			this.haskellService.getDirectoryContents(arch.moodleFilePath).subscribe (
				contents => {
					this.archivoClickeado = undefined;
					this.showLoadingFileIndicator = false;
					arch.contenido = "Seleccione un archivo para cargar su contenido ...";
					this.archivoClickeado = undefined;
					//TODO sacar si siempre viene de backend
					if (contents) {
						contents.map ((a: Archivo) => { if (!!a.directorioMatefun) a.directorioMatefun = arch.moodleFilePath });
					}
					this.archivos = this.archivos.concat(contents);
					this.loading = false;
					this.seleccionarArchivo2(arch, contents);
				},
				error => {
					this.showLoadingFileIndicator = false;
					this.archivoClickeado = undefined;
					console.log(error)
				}
			);
		} else {
			this.showLoadingFileIndicator = false;
			if (arch.directorio){
				this.archivoClickeado = undefined;
				this.seleccionarArchivo2(arch , this.archivos.filter( a => a.padreId==arch.id ) );
			}else{
				this.archivoSeleccionado = arch;
				this.preview = arch.contenido;
			}

		}
	}

	hayArchivoOriginal(){
		return !this.archivoSeleccionado.directorio && this.archivosCompartidos.some(a => a.id == this.archivoSeleccionado.archivoOrigenId);
	}

	seleccionarArchivoOriginal(){
		this.archivoSeleccionado = this.archivosCompartidos.find(arch => arch.id == this.archivoSeleccionado.archivoOrigenId);
		this.preview = this.archivoSeleccionado.contenido;
	}

	hayArchivoMio(){
		return !this.archivoSeleccionado.directorio && this.archivosCompartidos.some(a => a.archivoOrigenId == this.archivoSeleccionado.id);	
	}

	seleccionarArchivoMio(){
		this.archivoSeleccionado = this.archivosCompartidos.find(a => a.archivoOrigenId == this.archivoSeleccionado.id);
		this.preview = this.archivoSeleccionado.contenido;
	}

	verCalificacion(){
		this.dialogService.addDialog(VerCalificacionComponent, {
			archivo:this.archivoSeleccionado
		}).subscribe((isConfirmed)=>{
			if(isConfirmed) {
				this.notifService.success("confirmado?");
			}
		});
	}


	

}
