import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo, Evaluacion } from '../../shared/objects/archivo';

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
                      <h5 class="modal-title">Calificar entrega</h5> 
                      <button type="button" class="close" (click)="close()" style="margin-left:8px;">&times;</button>
                   </div>
                   
                   <div class="modal-body">
                    <form>                      
                      <div class="form-group">
                        <label for="message-text" class="form-control-label">Calificacion (1-100):</label>
                        <input type="number" class="form-control" [(ngModel)]="nota" min=1 max=100 [ngModelOptions]="{standalone: true}" >                        
                      </div>
                      <div class="form-group">
                        <label for="message-text" class="form-control-label">Detalle:</label>
                        <textarea class="form-control" id="message-text" [(ngModel)]="descripcion" [ngModelOptions]="{standalone: true}" ></textarea>
                      </div>
                    </form>
                  </div>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
                    <button type="button" class="btn btn-success" (click)="confirm()">Calificar</button>
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
      this.descripcion = this.archivo.evaluacion.descripcion;
      this.nota = this.archivo.evaluacion.nota;
    }
  }

  confirm() {
    var evaluacion = new Evaluacion();
    evaluacion.cedulaDocente = this.cedula;
    evaluacion.descripcion = this.descripcion;
    evaluacion.nota = this.nota;
    if(this.nota>0 && this.nota<100){
      this.parentContext.haskellService.calificarArchivo(this.archivo.id,evaluacion )
       .subscribe(
        evaluacion => {
          this.parentContext.notifService.success("Archivo evaluado");
          this.archivo.evaluacion = evaluacion;
          this.close();
        }, 
        error => {
          this.parentContext.notifService.error(error);
        });
    }else{
      this.parentContext.notifService.error("Calificacion fuera de rango");
    }
  }

  cancel(){
    this.close();
  }
  
}