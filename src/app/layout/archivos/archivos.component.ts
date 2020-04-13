import { Component,ViewChild } from '@angular/core';
import { Archivo } from '../../shared/objects/archivo';
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
import { SeleccionarDirectorioMove } from './seleccionarDirectorio.component';
import { CodemirrorComponent } from 'ng2-codemirror';
import { NgbPopoverConfig, NgbPopover} from '@ng-bootstrap/ng-bootstrap';

import 'codemirror/mode/haskell/haskell';
import 'codemirror/addon/display/panel';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/mode/markdown/markdown';

@Component({
	moduleId: module.id,
	selector: 'archivos',
	templateUrl: './archivos.component.html'
})

export class ArchivosComponent {
	archivos : Archivo[] = [];
	archivosCompartidos: Archivo[] = [];
	archivosCompartidosSinDuplicados: Archivo [] = [];
	archivoSeleccionado: Archivo;
	loading: boolean = false;
	loadingCompartidos:boolean = false;
	filtroNombre: string = '';
	idRecorridos :any = [];
	esAlumno :boolean;
	tree: any;
	preview: string = '';
	directorioActual:any;
	sortFunction:any;
	configCodeMirror = JSON.parse(sessionStorage.getItem('codeMirrorConfig')) ;

	constructor(
		private router: Router,
		private notifService: NotificacionService,
		private authService: AuthenticationService,
		private haskellService: HaskellService,
		private sessionService: SessionService,
		private dialogService:DialogService
		){
		this.esAlumno = JSON.parse(sessionStorage.getItem("currentUser")).tipo ==="alumno";
		this.directorioActual = {};
		this.directorioActual.archivos = [];
		this.configCodeMirror.readOnly = true;
	}
	@ViewChild(CodemirrorComponent) codemirror: CodemirrorComponent;

	ngOnInit(){
		this.sortFunction = 'tipo'
		let cedula = this.authService.getUser().cedula;
		this.loading = true;
		this.haskellService.getArchivos(cedula)
		.subscribe(
			archivos => {
				this.archivos = archivos;
				this.loading = false;
				this.buildTreeFromList();

			}, 
			error => console.log(error) 
			);

		if(this.esAlumno){
			this.loadingCompartidos = true;
			this.haskellService.getArchivosCompartidosAlumno(cedula)
			.subscribe(
				archivos => {
					this.archivosCompartidos = archivos;
					this.archivosCompartidosSinDuplicados = archivos.filter(arch => arch.archivoOrigenId != -1 || !archivos.some(a => a.archivoOrigenId == arch.id));
					this.loadingCompartidos = false;
				}, 
				error => console.log(error) 
				);

		}
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
		let cedula = this.authService.getUser().cedula;
		this.loading = true;
		this.haskellService.getArchivos(cedula)
		.subscribe(
			archivos => {
				this.archivos = archivos;
				this.loading = false;
				this.buildTreeFromList_setearDirectorioActual(idDirectorioActual);

			}, 
			error => console.log(error) 
			);
	}


	navBack(){
		var that =this;
		if(this.directorioActual.padreId!==-1){
			var padre = this.archivos.filter(function(a){return a.id===that.directorioActual.padreId})[0];
			this.directorioActual = padre;	
		}
		
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
	
	cargarArchivo(){
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
						let cedula = this.authService.getUser().cedula;
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

	confirmarEntrega(){
		let disposable = this.dialogService.addDialog(ConfirmComponent, {
			title:'Entregar archivo', 
			message:'¿Desea entregar el archivo "'+this.archivoSeleccionado.nombre+'"?\nNo se podrá editar luego de la entrega.',
			confirmText: 'Entregar',
			cancelText: 'Cancelar'
		})
		.subscribe((isConfirmed)=>{
			if(isConfirmed) {
				this.entregarArchivo();
			}
		});
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

			if(isConfirmed) {


				//codeMirrorRef.options.readOnly = false;
				//componentRef.editDialogFired = true;
			}
		});
	}
	mkFile(){
		var that = this;
		let disposable = this.dialogService.addDialog(NuevoArchivo, {
			nombre:'', 
			descripcion:'',
			esDirectorio:false,
			parentContext :that})
		.subscribe((isConfirmed)=>{

			if(isConfirmed) {


				//codeMirrorRef.options.readOnly = false;
				//componentRef.editDialogFired = true;
			}
		});
	}

	seleccionarArchivo = function(arch: Archivo){
		if(arch.directorio){
			this.directorioActual=arch;
		}else {
			this.sessionService.setDirectorioActual(this.directorioActual);
			this.sessionService.cargarDependencias(arch);
		}
		this.archivoSeleccionado = arch;	
		this.preview = arch.contenido;
		this.ordenarArchivos();
	}

	compartirArchivo(){
		if(this.archivoSeleccionado){
			var grupos = this.sessionService.getGrupos();
			if(grupos == undefined){
				this.haskellService.getGrupos(this.authService.getUser().cedula)
				.subscribe(
					gruposRest => {
						this.sessionService.setGrupos(grupos);
						this.dialogService.addDialog(CompartirArchivoComponent, {
							grupos:gruposRest, 
							archivo:this.archivoSeleccionado,
							parent:this
						})
						.subscribe((isConfirmed)=>{
							if(isConfirmed) {
								this.notifService.success("confirmado?");
							}
						});


					},
					error => {

					})
			}else{
				this.dialogService.addDialog(CompartirArchivoComponent, {
					grupos:grupos, 
					archivo:this.archivoSeleccionado,
					parent:this
				})
				.subscribe((isConfirmed)=>{
					if(isConfirmed) {
						this.notifService.success("confirmado?");
					}
				});
			}
		}else{
			this.notifService.warning("Archivo no seleccionado");
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
