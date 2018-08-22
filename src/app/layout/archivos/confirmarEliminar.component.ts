import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';
export interface ConfirmModel {
  nombreArchivo:string;
  esDirectorio:boolean;
  parentContext: any;

}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">
                   <div class="modal-header">
                      <h6 class="modal-title" *ngIf="!esDirectorio">Eliminar archivo</h6> 
                      <h6 class="modal-title" *ngIf="esDirectorio">Eliminar carpeta</h6> 
                      <button type="button" class="close" (click)="close()" style="margin-left:8px;">&times;</button>
                   </div>
                   <div class="modal-body">
                        <p *ngIf="!esDirectorio">¿Está seguro que desea eliminar el archivo {{nombreArchivo}}?</p>
                        <p *ngIf="esDirectorio">¿Está seguro que desea eliminar la carpeta {{nombreArchivo}}?</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" (click)="close()">Cancelar</button>
                    <button type="button" class="btn btn-success" (click)="confirmarEliminar()">Eliminar</button>
                  </div>
                 </div>
              </div>`
})
export class ConfirmarEliminar extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  nombreArchivo: string;
  esDirectorio: boolean;
  parentContext: any;
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
   confirmarEliminar(){
      var that = this.parentContext;
      var directorio = this.parentContext.archivoSeleccionado.directorio;
      this.parentContext.archivoSeleccionado.eliminado = true;
      if(directorio){
        delete this.parentContext.archivoSeleccionado['archivos'];
      }
      this.parentContext.haskellService.eliminarArchivo(this.parentContext.archivoSeleccionado.id)
      .subscribe(
        archivo => {
          console.log("Archivo eliminado");
          if(directorio){
            var idDirActual = that.directorioActual.padreId;
          }else {
            var idDirActual = that.directorioActual.id;
          }
          that.recargarArchivos(idDirActual);
          that.archivoSeleccionado = null;          
        }, 
        error => {
          this.parentContext.notifService.error(error);
        });
      this.close();
      
    }
  
}