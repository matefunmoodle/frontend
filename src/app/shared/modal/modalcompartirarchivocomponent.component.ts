import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { HaskellService } from '../services/haskell.service';
import { Archivo } from '../objects/archivo';
import { NotificacionService } from '../services/notificacion.service';

export interface ShareFileModel {
  archivo: Archivo;
  coursesGroupsAndMembers: object[];
  parentContext: any;
}
@Component({  
    selector: 'confirm',
    template: `
    <div class="modal-dialog" style="margin-top:100px;">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">Compartir archivo seleccionado</h4>
            <button type="button" class="close" (click)="close()">&times;</button>
        </div>
        <div class="modal-body">
            
            <!-- ARCHIVO -->
            <div class="row">
                <div class="col-md-8">
                    Archivo: <span style='font-style: italic;' ><b>{{ archivo.nombre }}</b></span>
                </div>
                <div class="col-md-4">
                </div>
            </div>

            <!-- CURSO -->
            <p class="mt-3">Indique con quien desea compartir el archivo</p>
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <label for="actividad">Seleccione el curso</label>
                    <select class="form-control" style="max-width:100%;" name="cursoSeleccionado" [(ngModel)]="cursoSeleccionado" (ngModelChange)="cursoChange($event)">
                        <option *ngFor="let c of coursesGroupsAndMembers" [ngValue]="c">
                            {{c.fullname}}
                        </option>
                    </select>
                </div>
                <div class="col-md-1"></div>
            </div>

            <div *ngIf="cursoSeleccionado" class="row mt-3">
                <div class="col-md-2"></div>
                <div class="col-md-1">
                    <input type="radio" name="Compartir a Grupo" [value]="'grupo'" [(ngModel)]="tipoDestinatario" (ngModelChange)="choose()" />
                </div>
                <div class="col-md-9">
                    Compartir a un grupo
                </div>
            </div>

            <div *ngIf="cursoSeleccionado" class="row">
                <div class="col-md-2"></div>
                <div class="col-md-1">
                    <input type="radio" name="Compartir individual" [value]="'usuario'" [(ngModel)]="tipoDestinatario" (ngModelChange)="choose()" />
                </div>
                <div class="col-md-9">
                    Compartir a usuarios individuales
                </div>
            </div>

            <div *ngIf="cursoSeleccionado" class="row">
                <div class="col-md-2"></div>
                <div class="col-md-1">
                    <input type="radio" name="Compartir individual" [value]="'curso'" [(ngModel)]="tipoDestinatario" (ngModelChange)="choose()" />
                </div>
                <div class="col-md-9">
                    Compartir al curso <b><i>'{{cursoSeleccionado.fullname}}'</i></b> por completo
                </div>
            </div>


            <!-- DESTINATARIOS -->
            <div *ngIf="tipoDestinatario==='usuario'" class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <label for="actividad">Seleccione los destinatario(s)</label>
                    <select class="form-control" id="topic" [(ngModel)]="participanteSeleccionado" (ngModelChange)="participanteChange($event)">
                        <option *ngFor="let p of participantesCurso" [ngValue]="p.moodleUserId">{{p.nombre}} {{p.apellido}}</option>
                    </select>
                </div>
                <div class="col-md-1"></div>
            </div>

            <div *ngIf="tipoDestinatario==='grupo' && grupos.length>0" class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <label for="actividad">Seleccione los grupo(s)</label>
                    <select class="form-control" id="topic" [(ngModel)]="grupoSeleccionado" (ngModelChange)="grupoChange($event)">
                        <option *ngFor="let g of grupos" [ngValue]="g.grupoId">{{g.grupo}}</option>
                    </select>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div *ngIf="tipoDestinatario==='grupo' && grupos.length===0" class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <p>El curso seleccionado no tiene grupos</p>
                </div>
                <div class="col-md-1"></div>
            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-success" (click)="confirm()">Compartir</button>
            <button type="button" class="btn btn-danger" (click)="close()">Cancelar</button>
        </div>
    </div>
</div>
              `
})



export class ModalCompartirArchivoComponent extends DialogComponent<ShareFileModel, boolean> implements OnInit, ShareFileModel {
  


    archivo: Archivo;
    nombreArchivo: string;
    coursesGroupsAndMembers: object[];
    parentContext: any;
    todosLosCursos: object[];
    compartiragrupo: boolean = true;
    cursoSeleccionado: object;
    cursoDestinoSeleccionado;
    participantesCurso: any[] = [];
    grupos: any[] = [];
    participanteSeleccionado: any;
    grupoSeleccionado: any;
    tipo: string;

    tipoDestinatario: string;

  constructor(private haskellService: HaskellService, dialogService: DialogService, private notifService: NotificacionService,) {
    super(dialogService);
  }

  ngOnInit() { }

  participanteChange(participante){
      this.participanteSeleccionado = participante;
  }

  grupoChange(grupo){
      this.grupoSeleccionado = grupo;
  }

  cursoChange(event) {
    this.tipoDestinatario = undefined;
    this.grupoSeleccionado = undefined;
    this.participanteSeleccionado = undefined;
    this.participantesCurso = [];
    this.grupos = [];
  }   

  

  choose() {
    if (this.tipoDestinatario==='curso') {
        this.participantesCurso = [];
        this.grupos = [];
    } else {
        const elCurso = this.coursesGroupsAndMembers.filter ( cgm => cgm['id'] === this.cursoSeleccionado['id'])[0];
        if (this.tipoDestinatario==='grupo') {
            this.participantesCurso = [];
            this.grupos = elCurso['grupos'];
        } else if (this.tipoDestinatario==='usuario') {
            this.grupos = [];
            this.participantesCurso = elCurso['participantes'];
        }
    }
    this.participanteSeleccionado = undefined;
    this.grupoSeleccionado = undefined;
  }

  confirm() {
    // we set dialog result as true on click on confirm button, 
    // then we can get dialog result from caller code 



    
    const gruposDestinatarios = this.grupoSeleccionado ? [this.grupoSeleccionado] : [];
    const participantesDestinatarios = this.participanteSeleccionado ? [this.participanteSeleccionado] : [];

    const dataShareFile = {
        'tipoDestinatario' : this.tipoDestinatario,
        'gruposDestinatarios' : gruposDestinatarios,
        'usuariosDestinatarios' : participantesDestinatarios,
        'archivo' : this.archivo,
        'cursoDestinatario' : this.cursoSeleccionado['id']
    }

    this.parentContext.compartiendo = true;
    this.parentContext.haskellService.compartirArchivo(dataShareFile).subscribe(
        data => {
            this.parentContext.compartiendo = false;
            if (data.wasOk)
                this.parentContext.notifService.success("Archivo compartido con exito.");
            else
                this.parentContext.notifService.error(data.message);
        }, 
        error => {
            this.parentContext.compartiendo = false;
            this.parentContext.notifService.error(error);
        });
    this.close();
  }
}