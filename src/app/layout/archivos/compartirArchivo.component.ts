import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Archivo } from '../../shared/objects/archivo';
import { Grupo } from '../../shared/objects/grupo';

export interface ConfirmModel {
  archivo: Archivo;
  grupos:any;
  parent:any;
}
@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">
                   <div class="modal-header">
                     <h6 class="modal-title pull-lefth">Compartir &quot;{{archivo.nombre}}&quot; con:</h6> 
                     <button type="button" class="close" (click)="close()" style="margin-rigth:8px;">&times;</button>
                   </div>
                   <div class="modal-body" style="height:350px;overflow-y: scroll;">
                       <div>
                         <div class="list-group">
                            <button *ngFor="let g of grupos" type="button" (click)="seleccionarGrupo(g)" style="cursor:pointer" class="list-group-item list-group-item-action" [ngClass]="{'active':grupo!=undefined && g.grado == grupo.grado && g.grupo == grupo.grupo && g.anio == grupo.anio && g.liceoId == grupo.liceoId}">
                                  <i class="fa fa-group" style="margin-right:10px; font-size: 3em; cursor: pointer;" aria-hidden="true" ></i>
                                 {{g.grado+"°"+g.grupo+" - "+g.anio}}
                            </button>
                          </div>
                        </div>
                     </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary" (click)="compartir()">Compartir</button>
                   </div>
                 </div>
              </div>`
})
export class CompartirArchivoComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  archivo: Archivo;
  grupos:any;
  grupo: Grupo;
  parent: any;
  
  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  seleccionarGrupo(grupo){
    this.grupo = grupo;
  }

  compartir(){
    if(this.grupo){
      this.parent.haskellService.compartirArchivoGrupo(this.grupo, this.archivo.id)
                .subscribe(
                    success => {
                        this.parent.notifService.success("Archivo compartido");
                        this.close();
                    }, 
                    error => {
                        this.parent.notifService.error(error);
                    });
    }else{
      this.parent.notifService.error("Seleccione un grupo");
    }
  }
}