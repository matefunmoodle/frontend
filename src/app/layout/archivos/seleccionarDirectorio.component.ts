import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';
export interface ConfirmModel {
  directorio: boolean;
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
                     <h6 class="modal-title pull-lefth">¿Dónde quieres mover el archivo?</h6> 
                     <button type="button" class="close" (click)="close()" style="margin-rigth:8px;">&times;</button>
                   </div>
                   <div class="modal-body" style="height:350px;overflow-y: scroll;">
                       <div>
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
                     <button type="button" class="btn btn-primary" (click)="move()">Mover aquí</button>
                   </div>
                 </div>
              </div>`
})
export class SeleccionarDirectorioMove extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  directorio: boolean;
  archivos:any;
  directorioActual:any;
  parent:any;
  nombre:string;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  move() {
    // we set dialog result as true on click on confirm button, 
    // then we can get dialog result from caller code 
    var that = this;
    if(this.nombre!==undefined && this.nombre!==""){
       this.parent.archivoSeleccionado.padreId = this.directorioActual.id;
       if(this.parent.archivoSeleccionado.directorio){
         delete this.parent.archivoSeleccionado['archivos'];
       }
       this.parent.haskellService.editarArchivo(this.parent.archivoSeleccionado.id,this.parent.archivoSeleccionado)
      .subscribe(
        archivo => {
          
          that.parent.recargarArchivos(this.directorioActual.id);
          that.parent.archivoSeleccionado = null;  
          
        }, 
        error => {
          this.parent.notifService.error(error);
        });
      
    }
    this.close();
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