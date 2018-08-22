import { Component, NgModule, ViewChild, HostListener, ElementRef, ComponentRef, TemplateRef } from '@angular/core';
import { CanvasModule} from '../canvas/canvas.module';
import { CanvasComponent } from '../canvas/canvas.component';
import { Http, JsonpModule } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { HaskellService } from '../../shared/services/haskell.service';
import { WebsocketService } from '../../shared/services/websocket.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { SessionService } from '../../shared/services/session.service';
import { GHCIService } from '../../shared/services/ghci.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { GHCI_URL } from '../../shared/config';
import { Archivo } from '../../shared/objects/archivo';
import { Configuracion } from '../../shared/objects/usuario';
import { ConfirmComponent } from './confirm.component';
import { SeleccionarDirectorioComp } from './seleccionarDirectorio.component';
import { DialogService } from "ng2-bootstrap-modal";
import { CodemirrorComponent } from 'ng2-codemirror';
import { NgbPopoverConfig, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverWindow } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import { NotificacionService } from '../../shared/services/notificacion.service';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
// import 'codemirror/mode/haskell/haskell';
import 'codemirror/addon/display/panel';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/lib/codemirror';
import 'codemirror/addon/search/search';


import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';

import './codemirror-matefun-mode.js'

var codeMirrorRef:any;
var componentRef : any;
var focus: any;
@Component({
    moduleId: module.id,
    selector: 'matefun',     
    templateUrl: './matefun.component.html',   
    styleUrls: ['./matefun.component.scss'],  
    providers: [ WebsocketService, NgbPopoverConfig, UsuarioService ]
})


export class MateFunComponent {

    consoleDisable: boolean = false;
    consolaVisible: boolean = true;
    cursorPanel: any;
    cursorPanelLabel: any;
    cursorLabelInit : boolean = false;
    entrada : string = '';
    archivo : Archivo;
    copiaNombreArchivo:string;
    copiaContenidoArchivo:string;
    modificado = false;
    argumentoI = false;
    argumentoF = false;
    editableLoaded = false;
    editDialogFired = false;
    archivosTree :any;
    idRecorridos: any;
    code: string ='';
    configCodeMirror = {
        readOnly: false,
        lineNumbers: true,
        lineWrapping : true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        mode: {
            name: "matefun", 
            globalVars: true
        },
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
        theme: 'dracula',
        fontSize: 12
    };
    themes = ['3024-day', '3024-night', 'abcdef', 'ambiance-mobile', 'ambiance', 'base16-dark', 'base16-light', 'bespin', 'blackboard', 'cobalt', 'colorforth', 'dracula', 'duotone-dark', 'duotone-light', 'eclipse', 'elegant', 'erlang-dark', 'hopscotch', 'icecoder', 'isotope', 'lesser-dark', 'liquibyte', 'material', 'mbo', 'mdn-like', 'midnight', 'monokai', 'neat', 'neo', 'night', 'panda-syntax', 'paraiso-dark', 'paraiso-light', 'pastel-on-dark', 'railscasts', 'rubyblue', 'seti', 'solarized', 'the-matrix', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'ttcn', 'twilight', 'vibrant-ink', 'xq-dark', 'xq-light', 'yeti', 'zenburn']


    constructor(
        private haskellService: HaskellService,
        private authService: AuthenticationService, 
        private ghciService: GHCIService, 
        private elRef: ElementRef, 
        private notifService: NotificacionService,
        private sessionService: SessionService,
        private dialogService:DialogService,
        private usuarioService: UsuarioService) {
        //si el archivo fue seteado en la session. 
        this.archivo = sessionService.getArchivo();
        if(!this.archivo || !this.archivo.id){
            this.newFile();
        }
        this.copiaContenidoArchivo = this.archivo.contenido;
        this.copiaNombreArchivo = this.archivo.nombre;
        if(authService.getUser().configuracion){
            var config: Configuracion = authService.getUser().configuracion;
            if(config.fontSizeEditor<=30 && config.fontSizeEditor>=8){
                this.configCodeMirror.fontSize = config.fontSizeEditor;
            }
            if(this.themes.some(theme => theme==config.themeEditor)){
                this.configCodeMirror.theme = config.themeEditor;                
            }
            sessionStorage.setItem('codeMirrorConfig',JSON.stringify(this.configCodeMirror));
            this.argumentoI = config.argumentoI;
            this.argumentoF = config.argumentoF;

        }
        this.code = "my code";
        let svg : string = '';

    }


    @ViewChild(CodemirrorComponent) codemirror: CodemirrorComponent;
    // @ViewChild(NgbPopover) popover: NgbPopover;
    @ViewChild('popover') popover: NgbPopover;

    updateConfig(theme){
        this.configCodeMirror.theme = theme;
        this.codemirror.instance.setOption('theme', theme); 
        sessionStorage.setItem('codeMirrorConfig',JSON.stringify(this.configCodeMirror));
    }

    lockSaveButton (){
        this.copiaNombreArchivo = this.archivo.nombre;
        this.copiaContenidoArchivo = this.archivo.contenido;
        this.modificado = false;
    }
    

    showConfirm() {
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title:'Está intentando editar un archivo de solo lectura', 
            message:'Está editando un archivo de solo lectura, desea continuar?'})
        .subscribe((isConfirmed)=>{

            if(isConfirmed) {
                codeMirrorRef.options.readOnly = false;
                componentRef.editDialogFired = true;
            }
        });        
    }

    /* Panel para la posición del cursor */
    makePanel() {

        var node = document.createElement("div");
        node.id = "cursorpos-panel";
        node.className = "panel bottom";
        this.cursorPanelLabel = node.appendChild(document.createElement("span"));
        var cm = this.codemirror.instance;
        var x = cm.getCursor().line;
        var y = cm.getCursor().ch; 
        x = (Number(x) + 1).toString();
        y = (Number(y) + 1).toString();
        this.cursorPanelLabel.textContent = "Posición del cursor: (" + x + "," + y + ")";    


        this.cursorPanel = this.codemirror.instance.addPanel(node, {position: "bottom", stable: true});
        var that = this;
        //agregamos el evento que setea la posición
        this.codemirror.instance.on("cursorActivity",function(cm){
            var x = cm.getCursor().line;
            var y = cm.getCursor().ch; 
            x = (Number(x) + 1).toString();
            y = (Number(y) + 1).toString();
            that.cursorPanel.node.innerText = "Posición del cursor: (" + x + "," + y + ")";    
        });

        this.codemirror.instance.on("keyHandled",function(cm,name,evt){
            if(name.code==="Digit1" && name.ctrlKey && name.shiftKey){
                that.seleccionarDirectorio();
            } else if(name.code==="Digit2" && name.ctrlKey && name.shiftKey){
                that.saveConfig();
            }
        });

        this.codemirror.instance.on("keypress",function(cm,name,evt){

            if(!that.editDialogFired && JSON.parse(sessionStorage.currentUser).tipo === "docente" && cm.options.readOnly){
                codeMirrorRef = that.codemirror.instance;
                componentRef = that;
                that.showConfirm(); 
            }

        });
    } 

    saveConfig(){
        var config = new Configuracion();
        config.themeEditor = this.configCodeMirror.theme;
        config.fontSizeEditor = this.configCodeMirror.fontSize;
        var confUser = this.authService.getUserConfig();
        var reiniciar = confUser.argumentoF != this.argumentoF || confUser.argumentoI != this.argumentoI;
        config.argumentoF = this.argumentoF;
        config.argumentoI = this.argumentoI;
        this.usuarioService.actualizarConfiguracion(this.authService.getUser().cedula,config)
        .subscribe(
            success=> {
                //this.ghciService.consoleRef.Write("Configuración guardada"  + "\n");
                this.popover.close();
                this.authService.setUserConfig(success);
                if(reiniciar){
                    this.reiniciarInterprete();
                }

            },
            error=> {
                this.notifService.error(error);
                this.popover.close();
            }
            );
    }

    aumentarFuente(){
        if(this.configCodeMirror.fontSize<30){
            this.configCodeMirror.fontSize++;
        }
    }

    disminuirFuente(){
        if(this.configCodeMirror.fontSize>8){
            this.configCodeMirror.fontSize--;
        }
    }

    @HostListener('document:click', ['$event'])
    private documentClicked(event: MouseEvent): void {

        // Popover is open
        if (this.popover && this.popover.isOpen()) {

            // Not clicked on self element
            if (!(this.popover as any)._elementRef.nativeElement.contains(event.target)) {

                // Hacking typescript to access private member
                const popoverWindowRef: ComponentRef<NgbPopoverWindow> = (this.popover as any)._windowRef;

                // If clicked outside popover window
                if (!popoverWindowRef.location.nativeElement.contains(event.target)) {
                    this.popover.close();
                }
            }
        }
    }

    ngOnInit() {

        this.ghciService.rendered(); 


        this.haskellService.getArchivos(this.authService.getUser().cedula)
        .subscribe(
            archivos => {
                //.filter(function(a){return !a.eliminado})
                this.buildTreeFromList(archivos);

            }, 
            error => console.log("Error al obtener los archivos del alumno") 
            );

        function KeyPress(e) {

            var evtobj = window.event? event : e
            if (evtobj.keyCode == 90 && evtobj.ctrlKey){
                //alert("Ctrl+z")
            };
            if(evtobj.key.toLowerCase() ==="a" && evtobj.ctrlKey){
                componentRef.seleccionarDirectorio();
                return false;
            }else if(evtobj.key.toLowerCase() ==="e" && evtobj.ctrlKey){
                componentRef.downloadFile();
                return false;
            } else if(evtobj.key.toLowerCase() ==="r" && evtobj.ctrlKey){
                componentRef.reiniciarInterprete();
                return false;
            } else if(evtobj.key.toLowerCase() ==="g" && evtobj.ctrlKey){
                componentRef.guardarArchivo();
                return false;
            } else if(evtobj.key.toLowerCase() ==="o" && evtobj.ctrlKey){
                document.getElementById("popover").click();
                return false;
            } else if(evtobj.ctrlKey && evtobj.altKey && evtobj.key.toLowerCase() ==="p"){
                document.getElementById("ProgramBtn").click();
                var that  = componentRef;
                setTimeout(function() {
                    that.codemirror.instance.focus();
                },250);
                componentRef.codemirror.instance.focus();
                focus ="program";
                return false;
            }  else if(evtobj.ctrlKey && evtobj.altKey && evtobj.key.toLowerCase() ==="c"){
                componentRef.ghciService.focusConsole();
                focus = "consola";
                return false;
            }  else if(evtobj.ctrlKey && evtobj.altKey && evtobj.key.toLowerCase() ==="f"){
                document.getElementById("FigurasBtn").click()
                componentRef.ghciService.focusConsole();
                focus = "graficas";
                return false;
            }  else if(evtobj.key.toLowerCase() ==="p" && evtobj.ctrlKey && !evtobj.altKey){
                componentRef.runCode();
                return false;
            } 
        }
        document.onkeydown = KeyPress;
    }

    ngAfterViewInit() {
        componentRef = this;
        if(this.codemirror.instance!=null && !this.cursorLabelInit){
            this.cursorLabelInit = true;
            this.codemirror.instance.setOption('theme', this.configCodeMirror.theme);
            this.makePanel();    
        }
        if(!this.editableLoaded && this.codemirror.instance!=null &&(this.sessionService.archivo.editable!==undefined)){
            try{
                var editable = this.sessionService.archivo.editable && (this.sessionService.archivo.estado == 'Edicion' || this.sessionService.archivo.estado == 'Devuelto');
                this.codemirror.instance.options.readOnly = !editable;
                this.editableLoaded = true;


            } catch(err) {
                return;

            }
        }

    }
    
    htmlEncode(value:string){
        return value
        .replace('Prelude> ','')
        .replace(/&/g, '&amp;')
        .replace(/\s/g, '&nbsp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    @ViewChild(CanvasComponent) canvasC: CanvasComponent;

    funcionSTR: string = 'Math.sin(x)*x*x-20';
    consola: string = '';
    command: string = '';
    tipo: number = 1;

    private onKey = function (value: string) {
        this.funcionSTR = value;
        this.archivo.contenido = value;
    }

    private writeCommand = function (value: string){
        this.command = value.split("\n")[value.split("\n").length - 1];
    }

    private selectFunction = function() {
        this.tipo = 1;
        this.funcionSTR = "Math.sin(x)*x*x-20";
    }

    private selectElipse = function() {
        this.tipo = 2;
        this.funcionSTR = "elipse(x,y,radioX, radioY, rotacion_en_grados)";
    }

    private selectCircle = function() {
        this.tipo = 3;
        this.funcionSTR = "circulo(x,y,radio)";
    }

    private elipse = function(x: number, y: number, radiusX: number, radiusY: number, rotation: number) {
        return [x, y, radiusX, radiusY, rotation];
    }

    private circulo = function(x: number, y: number, radius: number) {
        return [x, y, radius];
    }

    inputConsola(text:any){
        this.entrada = text;            
    }
    newFile(){
        this.archivo = new Archivo();
        this.archivo.cedulaCreador = this.authService.getUser().cedula;
        this.archivo.contenido = "";
        this.archivo.nombre = "";
        this.copiaNombreArchivo = '';
        this.copiaContenidoArchivo = '';
    }

    archivoModificado(){
        if(this.copiaNombreArchivo!=this.archivo.nombre || this.copiaContenidoArchivo != this.archivo.contenido){
            this.modificado = true;
        }else{
            this.modificado = false;
        }
    }

    guardarArchivo(){
        var regex = /^[A-Z]/
        if(this.archivo.nombre.trim() == ""){
            this.notifService.error("Nombre de archivo sin especificar");
        }else if (!regex.test(this.archivo.nombre)){
            this.notifService.error("Nombre de archivo debe iniciar con mayusula.")
        }else{
            if(this.archivo.id){
                this.haskellService.editarArchivo(this.archivo.id, this.archivo)
                .subscribe(
                    archivo => {
                        //this.ghciService.consoleRef.Write("Editar archivo: " + this.archivo.nombre + "\n");
                        this.archivo = archivo;
                        this.lockSaveButton();
                    }, 
                    error => {
                        this.notifService.error(error);
                    });
            }else{
                this.haskellService.crearArchivo(this.archivo)
                .subscribe(
                    archivo => {
                        //this.ghciService.consoleRef.Write("Archivo creado: " + this.archivo.nombre + "\n");
                        this.archivo = archivo;
                        this.lockSaveButton();
                    }, 
                    error => {
                        this.notifService.error(error);
                    });

            }
        }
    }
    runCode(){

        this.ghciService.setCodemirrorRef(this.codemirror.instance);
        this.ghciService.resetGutters();
        var regex = /^[A-Z]/
        if(this.archivo.nombre.trim() == ""){
            this.notifService.error("Nombre de archivo sin especificar");
        }else if (!regex.test(this.archivo.nombre)){
            this.notifService.error("Nombre de archivo debe iniciar con mayusula.")
        }else{

            var resultado = this.sessionService.cargarDependencias(this.archivo);
            if(resultado["status"]==="miss"){
                this.ghciService.outputConsole("Error: No se encuentra el archivo " + resultado["nombre"] + "\n");
                return;
            }
            if(this.archivo.id){
                if(this.archivo.editable || this.authService.getUser().tipo == 'docente'){
                    this.haskellService.editarArchivo(this.archivo.id, this.archivo)
                    .subscribe(
                        archivo => {
                            this.archivo = archivo;
                            var list = this.sessionService.getDependencias(),
                            idList = [];
                            for(var l in list){
                                idList.push(list[l].id);
                            }
                            if(!idList.some(id => id ==archivo.id)){
                                idList.push(archivo.id);
                            }
                            this.lockSaveButton();
                            this.ghciService.loadFile(archivo.id,idList);
                        }, 
                        error => {
                            this.notifService.error(error);
                        });
                }else{
                    var list = this.sessionService.getDependencias(),
                    idList = [];
                    for(var l in list){
                        idList.push(list[l].id);
                    }
                    if(!idList.some(id => id ==this.archivo.id)){
                        idList.push(this.archivo.id);
                    }
                    this.ghciService.loadFile(this.archivo.id,idList);
                }
            }else{
                this.haskellService.crearArchivo(this.archivo)
                .subscribe(
                    archivo => {
                        this.archivo = archivo;
                        this.lockSaveButton();
                        this.ghciService.loadFile(archivo.id,[]);
                    }, 
                    error => {
                        this.notifService.error(error);
                    });
            }
        }
        this.ghciService.focusConsole();

    }
    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(text));
        element.setAttribute('download', filename+ ".mf");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    downloadFile(){
        var nom = this.archivo.nombre;
        var content = this.archivo.contenido;
        if(nom!= undefined && nom!="" && content!= undefined && content !=""){
            this.download(nom , content);
        }

    }
    reiniciarInterprete(){
        this.ghciService.reiniciarInterprete();
    }

    toggleConsole(){
        this.consolaVisible = !this.consolaVisible;
    }

    seleccionarDirectorio(){
        this.archivosTree = this.sessionService.getArchivos(undefined);
        var that = this;
        let disposable = this.dialogService.addDialog(SeleccionarDirectorioComp, {
            title:'', 
            message:'',
            archivos:this.archivosTree,
            directorioActual:this.archivosTree,
            nombre:'',
            parent:this})
        .subscribe((isConfirmed)=>{

            if(isConfirmed) {


                //codeMirrorRef.options.readOnly = false;
                //componentRef.editDialogFired = true;
            }
        });
    }


    buildTreeFromList (archivos){


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
        this.archivosTree = tree;
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
            });
    }



}
