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
                    <p *ngIf="errorMsg" style="color: red; font-size: smaller">{{errorMsg}}</p>
                    <button type="button" class="btn btn-success" (click)="confirm()">Crear</button>
                  </div>

                 </div>
              </div>`
})
export class NuevoArchivo extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  nombre: string;
  esDirectorio: boolean;
  descripcion: string;
  errorMsg: string = undefined;
  parentContext: any;
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    
    let archivo: Archivo = new Archivo();
    archivo.nombre = this.nombre.toLowerCase().endsWith('.mf') ? this.nombre : this.nombre + '.mf';
    
    console.log ('nombre: ' + archivo.nombre);
    console.log ('nombres: ' , this.parentContext.directorioActual.archivos.map ((a : Archivo) => a.nombre ));
    const exists = this.parentContext.directorioActual.archivos.find ((a: Archivo) => a.nombre===archivo.nombre);
    if (exists){
      this.errorMsg = "Ya existe un archivo con el nombre '"+archivo.nombre+"' en el directorio actual."
      window.setTimeout (() => {this.errorMsg = undefined} , 4000);
      return;
    }

    let desc = this.descripcion;
    archivo.cedulaCreador = this.parentContext.directorioActual.cedulaCreador;
    if(this.esDirectorio){
      archivo.contenido = desc;
    } else {
      archivo.contenido = '';
    }
    archivo.directorio = this.esDirectorio;
    archivo.editable = true;
    archivo.fechaCreacion  = new Date();
    archivo.padreId =  this.parentContext.directorioActual.id;
    archivo.directorioMatefun = this.parentContext.directorioActual.moodleFilePath==null ? '/' : this.parentContext.directorioActual.moodleFilePath;
    var that = this.parentContext;
    var regex = /^[A-Z]/
    if(regex.test(this.nombre)){
      this.parentContext.creandoArchivo = true;
      this.parentContext.haskellService.crearArchivo(archivo).subscribe(
        archivo => {
          console.log ('porqueriaNueva: ' , archivo)
          this.parentContext.creandoArchivo = false;
          this.parentContext.notifService.success('Archivo ' + archivo.nombre + ' creado con exito.');
          //that.recargarArchivos(that.directorioActual.id);
          that.recargarDirectorioActual();
        }, 
        error => {
          this.parentContext.creandoArchivo = false;
          this.parentContext.notifService.error(error);
        });
      this.close();
    }else{
      alert("Nombre de archivo debe iniciar con mayusula.")
    }
  }
  
}