import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';
export interface ConfirmModel {
  nombre:string;
  descripcion:string;
  parentContext: any;
  esDirectorio:boolean;

}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">

                   <div class="modal-header">
                      <h6 class="modal-title" *ngIf="esDirectorio">Nueva carpeta</h6> 
                      <h6 class="modal-title" *ngIf="!esDirectorio">Nuevo archivo</h6> 
                      <button type="button" class="close" (click)="close()" style="margin-left:8px;">&times;</button>
                   </div>
                   
                   <div class="modal-body">
                    <form>
                      <div class="form-group">
                        <label for="recipient-name" class="form-control-label">Nombre:</label>
                        <input type="text" class="form-control" id="recipient-name" [(ngModel)]="nombre" [ngModelOptions]="{standalone: true}" >
                      </div>
                      <div class="form-group" *ngIf="esDirectorio">
                        <label for="message-text" class="form-control-label">Descripción:</label>
                        <textarea class="form-control" id="message-text" [(ngModel)]="descripcion" [ngModelOptions]="{standalone: true}" ></textarea>
                      </div>
                    </form>
                  </div>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-success" (click)="confirm()">Crear</button>
                  </div>

                 </div>
              </div>`
})
export class NuevoArchivo extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  nombre: string;
  esDirectorio: boolean;
  descripcion: string;
  parentContext: any;
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    var nombre = this.nombre;
    var desc = this.descripcion;
    var archivo : Archivo;
    archivo = new Archivo();
    archivo.cedulaCreador = this.parentContext.directorioActual.cedulaCreador;
    if(this.esDirectorio){
      archivo.contenido = desc;
    } else {
      archivo.contenido = '';
    }
    archivo.directorio = this.esDirectorio;
    archivo.editable = true;
    archivo.fechaCreacion  = new Date();
    archivo.nombre = nombre;
    archivo.padreId =  this.parentContext.directorioActual.id;
    var that = this.parentContext;
    var regex = /^[A-Z]/
    if(regex.test(nombre)){
      this.parentContext.haskellService.crearArchivo(archivo).subscribe(
                      archivo => {
                        var id = that.directorioActual.id;
                        that.recargarArchivos(id);        
                      }, 
                      error => {
                          this.parentContext.notifService.error(error);
                      });
      

      this.close();
    }else{
      alert("Nombre de archivo debe iniciar con mayusula.")
    }
  }
  
}