import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';
import { Usuario } from '../../shared/objects/usuario';
export interface ConfirmModel {
  title:string;
  message:string;
  archivos:any;
  directorioActual:any;
  parent:any;
  nombre:string;
}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">
                   <div class="modal-header">
                     <h6 class="modal-title pull-lefth">¿Dónde quieres crear el archivo?</h6> 
                     <button type="button" class="close" (click)="close()" style="margin-rigth:8px;">&times;</button>
                   </div>
                   <div class="modal-body" style="height:350px;overflow-y: scroll;">
                       <div>
                         <div class="form-group">
                            <label for="file-name" class="form-control-label">Nombre:</label>
                            <input type="text" class="form-control" id="file-name" [(ngModel)]="nombre" >
                         </div>
                         <div class="list-group" >
                            <button *ngFor="let arch of directorioActual.archivos" type="button" (click)="navToDir(arch)" style="cursor:pointer" class="list-group-item list-group-item-action">
                                  <i *ngIf="arch.directorio" class="fa fa-folder" style="margin-right:10px; font-size: 3em; cursor: pointer;" aria-hidden="true" ></i>
                                  <i *ngIf="!arch.directorio" class="fa fa-file-text" style="margin-right:10px;font-size: 3em; cursor: pointer;" aria-hidden="true"></i>
                                 {{arch.nombre}}
                             </button>
                          </div>
                        </div>
                     </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-default" (click)="navBack()">Atras</button>
                     <button type="button" class="btn btn-primary" (click)="confirm()">Crear</button>
                   </div>
                 </div>
              </div>`
})
export class SeleccionarDirectorioComp extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  title: string;
  message: string;
  archivos:any;
  directorioActual:any;
  parent:any;
  nombre:string;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    // we set dialog result as true on click on confirm button, 
    // then we can get dialog result from caller code 
    var regex = /^[A-Z]/
    if(this.nombre==undefined || this.nombre==""){
        this.parent.notifService.error("Nombre de archivo invalido.");
    }else if (!regex.test(this.nombre)){
        this.parent.notifService.error("Nombre de archivo debe iniciar con mayusula.");
    }else{
      var archivo:Archivo = new Archivo();
      archivo.cedulaCreador = Usuario.getUser().cedula;
      archivo.contenido = "";
      archivo.nombre = this.nombre;
      archivo.directorio = false;
      archivo.padreId = this.directorioActual.id;
      archivo.editable = true;

      this.parent.haskellService.crearArchivo(archivo)
                .subscribe(
                    archivo => {
                        this.parent.archivo = archivo;
                        this.parent.ghciService.loadFile(archivo.id);
                        this.parent.sessionService.setArchivo(archivo);
                       
                    }, 
                    error => {
                        this.parent.notifService.error(error);
                    });
    
      this.result = true;
      this.close();
    }
  }

  navToDir(arch){
    if(arch.directorio){
      this.directorioActual = arch;  
    }
  }

  navBack(){
    var idPadre = this.directorioActual.padreId;
    var archivosList = this.parent.sessionService.getArchivosList();
    var nuevoDirectorioActual = archivosList.filter(function(a){return a.id===idPadre})[0];
    this.directorioActual=nuevoDirectorioActual;
  }
}