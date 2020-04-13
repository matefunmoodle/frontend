import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Usuario, MoodleCourseDTO, GrupoDTO } from '../objects/usuario';
import { Assignment } from '../objects/assignment';
import { Archivo } from '../objects/archivo';

export interface ConfirmModel {
  title:string;
  confirmText: string;
  cancelText:string;
  archivo: Archivo;
  allAssignments: Assignment[];
  parent:any;
}




@Component({  
    selector: 'confirm',
    template: `<div class="modal-dialog" style="margin-top:100px;">
                <div class="modal-content">
                   <div class="modal-header">
                     <h4 class="modal-title">{{title || 'Confirm'}}</h4>
                     <button type="button" class="close" (click)="close()" >&times;</button>
                   </div>
                   <div class="modal-body">

                    <div class="row">
                        <div class="col-md-1"></div>
                        <div class="col-md-10">
                          <label for="curso">Seleccione el curso sobre el cual desea hacer la entrega</label>
                          <select *ngIf="allAssignments" class="form-control" [(ngModel)]="idCursoSeleccionado" [ngModelOptions]="{standalone: true}" (ngModelChange)="cursoChange($event)">
                              <option *ngFor="let course of cursos" value="{{course.id}}">{{course.fullname}}</option>
                          </select>
                        </div>
                          <div class="col-md-1"></div>
                      </div>                     

                      
                       <div *ngIf="shownAssignments && shownAssignments.length>0" class="row mt-4">
                          <div class="col-md-1"></div>
                          <div class="col-md-10">
                             <label for="actividad">Seleccione la actividad que desea entregar</label>
                             <select [(ngModel)]="idAssignmentSeleccionado" class="form-control" id="actividad" [ngModelOptions]="{standalone: true}" (ngModelChange)="assignmentChange($event)">
                                <option *ngFor="let ass of shownAssignments" value="{{ass.id}}">{{ass.name}}</option>
                             </select>
                          </div>
                          <div class="col-md-1"></div>
                       </div>

                       <div class="row">
                          <div class="col-md-2"></div>
                          <div class="col-md-8">
                             <p style="font-style: italic;">{{message || ''}}</p>
                          </div>
                          <div class="col-md-2"></div>
                       </div>

                      <div class="row">
                        <p *ngIf="errormsg" style="font-size: 14px; text-align:left !important; color: red; font-weight: bold;">{{errormsg}}</p>
                      </div>
                      <div class="row">
                        <p *ngIf="yellowMsg" style="font-size: 14px; text-align:left !important; color: orange;">{{yellowMsg}}</p>
                      </div>
                      <div *ngIf="getAllEntregas.length > 0" class="row">
                        <p>Entregas anteriores: </p>&nbsp;&nbsp;&nbsp;
                        <p *ngFor="let entrega of getAllEntregas"><i> {{ entrega.filename }} ({{ entrega.modificado }})</i></p>
                      </div>
                      <div class="row">
                        <p *ngIf="deadline" style="font-size: 14px; text-align:left !important;">Finaliza: {{deadline}}</p>
                      </div>
                   </div>
                   <div class="modal-footer">
                     <img *ngIf="cargando" width=35 src="assets/img/cargaliceo.gif" alt=" ...">
                     <button type="button" [ngClass]="{'btn':true, 'btn-success': habilitado, 'btn-secondary': !habilitado }" (click)="confirm()">{{confirmText || 'Confirmar'}}</button>
                     <button type="button" class="btn btn-danger" (click)="close()" >{{cancelText || 'Cancelar'}}</button>
                   </div>
                 </div>
              </div>`
})
export class ConfirmEntregaComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel, OnInit {
  title: string;
  parent:any;
  submitionStatus: any;
  //entregasAnteriores: any;
  message: string;
  errormsg: string;
  confirmText: string;
  cancelText:string;
  deadline: string;
  idCursoSeleccionado : number;
  cursos : MoodleCourseDTO[];
  allAssignments: Assignment[];
  shownAssignments: Assignment[];
  idAssignmentSeleccionado: number;
  archivo: Archivo;
  habilitado: boolean = false;
  cargando: boolean = false;
  yellowMsg: string = '';
  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  ngOnInit() {
    this.shownAssignments = !this.idCursoSeleccionado ? [] :this.allAssignments.filter ( ass => ass.course===this.idCursoSeleccionado );
    this.cursos = Usuario.getUser().cursosQueSoyAlumno();
    this.reset();
  }
  
  reset() {
    this.message = '';
    this.errormsg = '';
    this.yellowMsg = '';
    this.deadline = '';
    this.submitionStatus = undefined;
    this.cargando = false;
  }

  extractFiles(subm: any): Array<any> {
    let allEntregas: Array<any> = [];
    if (subm.plugins && subm.plugins.length>0){
      const fileSubmitions = subm.plugins.find ((p) => p.type=='file');
      for (let ent of fileSubmitions.fileareas[0].files) {
        allEntregas.push ({
          filename : ent.filename,
          filesize : ent.filesize,
          modificado : this.timeConverter(new Date(ent.timemodified * 1000))
        });
      }
    }
    return allEntregas;
  }

  get getAllEntregas(): Array<any>{
    if (this.submitionStatus){
      if (this.submitionStatus.teamsubmission)
        return this.extractFiles(this.submitionStatus.teamsubmission);
      else if (this.submitionStatus.submission)
        return this.extractFiles(this.submitionStatus.submission);
    }
    return [];
  }

  get miGrupo() : GrupoDTO {
    const curso: MoodleCourseDTO = Usuario.getUser().todosLosCursos.find (c => c.id == this.idCursoSeleccionado);
    if (curso.grupos && curso.grupos.length==1)
      return curso.grupos[0];
    return null;
  }

  cursoChange(nuevoCurso: number){
    
    this.reset();

    this.shownAssignments = this.allAssignments.filter ( ass => ass.course=== (+nuevoCurso) );
    if (this.shownAssignments.length==0)
      this.errormsg = "no existen entregas posibles para este curso";
    else
      this.errormsg = undefined;
  }
  
  assignmentChange(ass){
    this.reset();
    const assSeleccionado: Assignment = this.shownAssignments.find (a => a.id===(+this.idAssignmentSeleccionado));
    const fechaFin: Date = new Date(assSeleccionado.duedate * 1000);
    
    const hoy: Date = new Date();
    const fechaInicio : Date = new Date(assSeleccionado.allowsubmissionsfromdate * 1000);
    if (hoy.getTime() < fechaInicio.getTime() ) {
      this.errormsg = 'Aun no puedes realizar la entrega, se habilita: ' + this.timeConverter(fechaInicio);
      this.habilitado = false;
    }else if (hoy.getTime() > fechaFin.getTime()) {
      this.errormsg = 'No puedes realizar la entrega, el periodo venció en: ' + this.timeConverter(fechaInicio);
      this.habilitado = false;
    } else {
      if (assSeleccionado.teamsubmission==1) {
        this.habilitado = false;
        this.cargando = true;
        this.parent.haskellService.getSubmissionStatus(this.idAssignmentSeleccionado, null, this.miGrupo.grupoId).subscribe(
          ss => {
            this.cargando = false;
            this.submitionStatus = ss;
            this.habilitado = !(this.submitionStatus.locked || !this.submitionStatus.canedit || !this.submitionStatus.caneditowner);
            if (!this.habilitado) {
              this.errormsg = 'La entrega se encuentra bloqueada';
            }else{
              const grp: GrupoDTO = this.miGrupo;
              if (grp)
                this.yellowMsg = 'NOTA: La entrega es grupal (' + this.miGrupo.grupo + ').'
              else
                this.yellowMsg = 'NOTA: La entrega es grupal.'

              this.deadline = assSeleccionado && assSeleccionado.duedate ? this.timeConverter(fechaFin) : '';
            }
          }, 
          error => {
            this.cargando = false;
            this.parent.notifService.error(error);
          }
        );
      }else{
        //entrega no grupal
        this.habilitado = false;
        this.cargando = true;
        this.parent.haskellService.getSubmissionStatus(this.idAssignmentSeleccionado, Usuario.getUser().moodleUserId, null).subscribe(
          ss => {
            this.cargando = false;
            this.submitionStatus = ss;
            this.habilitado = !(this.submitionStatus.locked || !this.submitionStatus.canedit || !this.submitionStatus.caneditowner);
            if (!this.habilitado) {
              this.errormsg = 'La entrega se encuentra bloqueada';
            }else{
              this.yellowMsg = 'NOTA: La entrega es individual.';
              this.deadline = assSeleccionado && assSeleccionado.duedate ? this.timeConverter(fechaFin) : '';
            }
          }, 
          error => {
            this.cargando = false;
            this.parent.notifService.error(error);
          }
        );
      }
    }
  }
  

  timeConverter(a: Date){
    let months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    return date + ' ' + month + ' ' + (year<10?'0'+year:year) + ' ' + (hour<10?'0'+hour:hour) + ':' + (min<10?'0'+min:min);
  }

  confirm() {
    if (!this.habilitado)
      return;
    this.parent.haskellService.entregarArchivoParaEvaluacion(this.idAssignmentSeleccionado, this.archivo ).subscribe(
      data => {
          console.log ('data: ' , data)
          this.parent.notifService.success("Archivo entregado con exito.");
      }, 
      error => {
          console.log ('error: ' , error)
          this.parent.notifService.error(error);
      });
      this.result = true;
      this.close();
  }
}