 import { Component, OnInit } from '@angular/core';
 import { FormsModule } from '@angular/forms';
 import { Services } from '../../shared/services/services.service';

@Component({
  moduleId: module.id,
  selector: 'cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})

export class CursosComponent implements OnInit {

  nombrecompleto : string;
  nombrecorto : string;
  formato : any;
  descripcion : string;
  fechainicio : any;
  fechafin : any;
  cantsecciones : string;
  docenteSeleccionado: any;
  cursoparaeliminar: any;
  listaCursoEliminar = []
  listaDocentes = []
  alertText : string
  alertType : string
  alertStatus : string
  creandoCurso: boolean;
  eliminandoCurso: boolean;
  horainicio: string;
  horafin: string;

  constructor(private genericServices : Services) { }

  ngOnInit() {

    this.creandoCurso = false;
    this.eliminandoCurso = false;
    //Cargar docentes para crear cursos
    this.genericServices.GET('/servicios/usuario/getAllNonSuspendedUsers').subscribe(
      data => { 
        this.listaDocentes = data
        console.log ('this.listaDocentes: ' , this.listaDocentes);
      },
      error => { this.showErrorAlert('No se pueden cargar los docentes desde moodle') }
    );

    //Cargar cursos para eliminar
    this.genericServices.GET('/servicios/cursos').subscribe(
      data => { this.listaCursoEliminar = data },
      error => { this.showErrorAlert('No se pueden cargar los cursos de moodle') }
    );

  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  deleteCourse(){
    this.eliminandoCurso = true;
    if (!this.cursoparaeliminar){
      this.showErrorAlert('Debe seleccionar un curso para eliminar')
      this.eliminandoCurso = false;
      return;
    }

    const nombreCurso = (this.listaCursoEliminar.filter( curso => curso.id == this.cursoparaeliminar))[0].fullname;

    if (confirm("Esta seguro de que desea eliminar el curso: " + nombreCurso )) {
      this.genericServices.DELETE('/servicios/cursos', this.cursoparaeliminar).subscribe(
        data => {
          this.listaCursoEliminar = this.listaCursoEliminar.filter( curso => curso.id != this.cursoparaeliminar ) 
          this.cursoparaeliminar = undefined;
          this.eliminandoCurso = false;
          this.showAlert('Curso '+nombreCurso+' eliminado con exito')
        },
        error => {
          this.eliminandoCurso = false;
          this.showErrorAlert('No se pudo eliminar el curso ' + nombreCurso)
        }
      );
    } 


  }


  async showAlert(text){
    this.alertText = text
    this.alertType = 'success'
    this.alertStatus = ''
    await this.delay(3000);
    this.alertStatus = 'hidden'
    this.alertText = ''
  }

  async showErrorAlert(text){
    this.alertText = text
    this.alertType = 'danger'
    this.alertStatus = ''
    await this.delay(3000);
    this.alertStatus = 'hidden'
    this.alertText = ''
  }

  convertirFecha(fecha: any, hora: string) {
    
    const aa = fecha.year
    const mo = fecha.month < 10 ? '0'+fecha.month : fecha.month+''
    const dd = fecha.day < 10 ? '0'+fecha.day : fecha.day+''
    
    const hh = hora.split(':')[0]
    const mm = hora.split(':')[1]
    const ss = hora.split(':')[2]
    
    const timeStr = aa + '-' + mo + '-' + dd + ' ' + hh + ':' + mm + ':' + ss
    
    const result = new Date( timeStr ).getTime()/1000
    return result
  }

  crearCurso(){
    
    this.creandoCurso = true;
    
    if (!this.nombrecompleto){
      this.showErrorAlert('Debe introducir nombre completo')
      this.creandoCurso = false;
      return;
    }

    if (!this.nombrecorto){
      this.showErrorAlert('Debe introducir un nombre corto para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.formato){
      this.showErrorAlert('Debe seleccionar un formato para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.descripcion){
      this.showErrorAlert('Debe colocar una descripcion para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.fechainicio){
      this.showErrorAlert('Debe seleccionar una fecha de inicio para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.fechafin){
      this.showErrorAlert('Debe seleccionar una fecha de fin para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.horainicio){
      this.showErrorAlert('Debe seleccionar una hora de inicio para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.horafin){
      this.showErrorAlert('Debe seleccionar una fecha de fin para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.cantsecciones){
      this.showErrorAlert('Debe introducir cantidad de secciones para el curso')
      this.creandoCurso = false;
      return;
    }

    if (!this.docenteSeleccionado){
      this.showErrorAlert('Debe seleccionar un docente para el curso')
      this.creandoCurso = false;
      return;
    }
    
    let courseRequestObj = {
      'fullname' : this.nombrecompleto,
      'shortname' : this.nombrecorto,
      'startdate' : this.convertirFecha(this.fechainicio, this.horainicio),
      'summary' : this.descripcion,
      'enddate' : this.convertirFecha(this.fechafin, this.horafin),
      'format' : this.formato,
      'numsections' : this.cantsecciones,
      'firstProfessorUserId' : this.docenteSeleccionado
    }

    this.genericServices.POST('/servicios/cursos/createNewCourse',courseRequestObj).subscribe(
      data => {
        this.creandoCurso = false;
        this.showAlert('Curso ' +this.nombrecompleto+ ' creado con exito')
        this.resetearCamposCrearCurso()
        //Cargar cursos para eliminar
        this.genericServices.GET('/servicios/cursos').subscribe(
          data => { this.listaCursoEliminar = data },
          error => { this.showErrorAlert('No se pueden cargar los cursos de moodle') }
        );
      },
      error => {
        this.creandoCurso = false;
        this.showErrorAlert('No se pudo crear el curso ' + this.nombrecompleto)
        this.resetearCamposCrearCurso()
      }
    );
    
      
  }

  resetearCamposCrearCurso(){
    this.docenteSeleccionado = ''
    this.cantsecciones = ''
    this.formato = ''
    this.fechafin = ''
    this.descripcion = ''
    this.fechainicio = ''
    this.nombrecorto = ''
    this.nombrecompleto = ''
    this.horafin = ''
    this.horainicio = ''
  }

}
