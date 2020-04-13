import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';

export interface ConfirmModel {
  cedula:string;
  archivo: Archivo;
  parentContext: any;
}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">

                   <div class="modal-header">
                      <h5 class="modal-title">{{ archivo.evaluacion.corregido ? 'Detalle' : 'Calificar' }} entrega</h5> 
                      <button type="button" class="close" (click)="close()" style="margin-left:8px;">&times;</button>
                   </div>
                   
                   <div class="modal-body">
                    <form>                      
                      <div class="form-group">
                        <label for="message-text" class="form-control-label">Calificacion (0-100):</label>
                        <input [disabled]="archivo.evaluacion.corregido" type="number" class="form-control" [(ngModel)]="nota" min=1 max=100 [ngModelOptions]="{standalone: true}" >                        
                      </div>
                      <div class="form-group">
                        <label for="message-text" class="form-control-label">Detalle:</label>
                        <textarea [disabled]="archivo.evaluacion.corregido" class="form-control" id="message-text" [(ngModel)]="descripcion" [ngModelOptions]="{standalone: true}" ></textarea>
                      </div>
                    </form>
                  </div>

                  <div class="modal-footer">
                    <img *ngIf="cargando" width=35 src="assets/img/cargaliceo.gif" alt=" ...">
                    <button type="button" class="btn btn-secondary" (click)="cancel()"> {{ archivo.evaluacion.corregido ? 'Cerrar' : 'Cancelar' }}</button>
                    <button *ngIf="!archivo.evaluacion.corregido" type="button" class="btn btn-success" (click)="confirm()">Calificar</button>
                  </div>
                 </div>
              </div>`
}) 
export class CalificarEntrega extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  descripcion: string = "";
  cedula: string;
  archivo: Archivo;
  nota: number = 1;
  parentContext: any;

  constructor(dialogService: DialogService) {
    super(dialogService);
    
  }

  ngOnInit() {
    if(this.archivo.evaluacion){
      this.descripcion = this.archivo.evaluacion.descripcion ? this.archivo.evaluacion.descripcion.replace(/<\/?[^>]+(>|$)/g, "") : null;
      this.nota = !!this.archivo.evaluacion.nota ? parseFloat(this.archivo.evaluacion.nota.toString()) : undefined;
    }
  }

  confirm() {
    
    if(this.nota>=0 && this.nota<=100) {
      this.parentContext.calificando = true;
      this.archivo.evaluacion.nota = this.nota;
      this.archivo.evaluacion.descripcion = this.descripcion;
      this.parentContext.haskellService.calificarArchivo(this.archivo)
       .subscribe(
        archivo => {
          this.parentContext.calificando = false;
          this.parentContext.notifService.success("Archivo corregido con éxito.");
          if (this.parentContext.modoGrupal) {
            console.log ('grupal')
            this.parentContext.grupoSeleccionado.archivos = [...this.parentContext.grupoSeleccionado.archivos.filter((a:Archivo) => a.id != this.archivo.id) , archivo ];
            for (let alumnoGrupo of this.parentContext.grupoSeleccionado.alumnos){
              alumnoGrupo.archivos = this.parentContext.grupoSeleccionado.archivos
              console.log (alumnoGrupo.nombre + ' ' + alumnoGrupo.apellido + ': ', alumnoGrupo.archivos )
            }
            console.log ('this.parentContext.grupoSeleccionado: ' , this.parentContext.grupoSeleccionado.archivos);
          }else{
            console.log ('individual')
            this.parentContext.alumnoIndividualSeleccionado.archivos = [...this.parentContext.alumnoIndividualSeleccionado.archivos.filter((a:Archivo) => a.id != this.archivo.id) , archivo ];
          }
          this.parentContext.archivoSeleccionado = undefined;
        }, 
        error => {
          this.parentContext.calificando = false;
          this.parentContext.notifService.error(error);
        });
    }else{
      this.parentContext.notifService.error("Calificacion fuera de rango");
    }
    this.close();
  }

  cancel(){
    this.close();
  }
  
}