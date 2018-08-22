import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo, Evaluacion } from '../../shared/objects/archivo';

export interface ConfirmModel {
  archivo: Archivo;
}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">
                   <div class="modal-header">
                     <h6 class="modal-title pull-lefth">Calificación &quot;{{archivo.nombre}}&quot;:</h6> 
                     <button type="button" class="close" (click)="close()" style="margin-rigth:8px;">&times;</button>
                   </div>
                   <div class="modal-body">
                       <div>
                         <label><b>Fecha: </b></label>&nbsp; {{archivo.evaluacion.fecha | date}}<br>
                         <label><b>Nota (1-100): </b></label>&nbsp; {{archivo.evaluacion.nota}}<br>
                         <label><b>Detalle: </b></label>&nbsp; {{archivo.evaluacion.descripcion}}
                       </div>
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary" (click)="close()">Cerrar</button>
                   </div>
                 </div>
              </div>`
})
export class VerCalificacionComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  archivo: Archivo;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }
}