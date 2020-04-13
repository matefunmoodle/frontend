import { Component, OnInit } from '@angular/core';
import { MoodleService } from '../../shared/services/moodle.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { Services } from '../../shared/services/services.service';

@Component({
  moduleId: module.id,
  selector: 'ieducativa',
  templateUrl: './ieducativa.component.html',
  styleUrls: ['./ieducativa.component.scss']
})

export class IEducativaComponent implements OnInit {

  ietiqueta = null
  iurl = null
  eetiqueta = null
  schoolList = [];
  editmode : boolean[] = [];
  alertText : string
  alertType : string
  alertStatus : string
  viewclass : string[] = []
  editclass : string[] = []
  editliceoname : string[] = []
  editliceoservicename : string[] = []
  editliceoservicetoken : string[] = []
  editmoodleuri : string[] = []
  servicename : string
  servicetoken : string

  constructor(private moodleService: MoodleService, private genericServices : Services, private authenticationService: AuthenticationService) { }



  resetEditForm(){
    this.editmode = []
    for (let k = 0 ; k<this.schoolList.length ; k++){
      this.schoolList[k].order = k;
      this.viewclass[k] = 'visible'
      this.editclass[k] = 'hidden'
    }
  }

  getTodosLosLiceos(){
    
    this.authenticationService.getAllSchools().subscribe(  
      data => {
          this.schoolList = data;
          this.resetEditForm();
      },
      error => { console.log(error); }
    );
  }


  ngOnInit() {
  	this.ietiqueta='';
    this.iurl='';
    this.alertStatus = 'hidden'
    this.getTodosLosLiceos();
  }

  resetAddLiceoForm(){
    this.ietiqueta =
    this.iurl =
    this.servicename =
    this.servicetoken = ''
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

  addSchool() {

    const data = { "liceoid": '' ,
                 "nombre": this.ietiqueta,
                 "moodleuri": this.iurl,
                 "servicename" : this.servicename,
                 "servicetoken" : this.servicetoken
                }
    //'/servicios/liceo/addNewSchool
    
    this.genericServices.POST('/servicios/liceo/addNewSchool',data).subscribe(
      data => {
        this.showAlert(this.ietiqueta + ' agregado con exito.')
        this.resetAddLiceoForm();
        this.getTodosLosLiceos();
      },
      error => {
        this.showErrorAlert('Error al agregar ' + data.nombre)
      }
    );
  }

  

  delete(event, liceo){
    if (confirm("Esta seguro que desea eliminar el liceo: " + liceo.nombre + "?")) {
      this.moodleService.deleteSchool(liceo.liceoid).subscribe(
          data => {
              this.showAlert(liceo.nombre + ' eliminado con exito')
              this.schoolList = this.schoolList.filter(function(value, index, arr){
                return value.liceoid != liceo.liceoid;
              });
          },
          error => {
              this.showErrorAlert('Error al eliminar el liceo ' + liceo.nombre )
          }
      );
    }

  }

  edit(event, item){
    this.viewclass[item.order] = 'hidden'
    this.editclass[item.order] = 'visible'
    this.editliceoname[item.order] = item.nombre 
    this.editmoodleuri[item.order] = item.moodleuri
    this.editliceoservicename[item.order] = item.servicename
    this.editliceoservicetoken[item.order] = item.servicetoken
  }

  canceledit(event, item){
    this.viewclass[item.order] = 'visible'
    this.editclass[item.order] = 'hidden'
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  save(event, item){
    
    const data = { "liceoid": item.liceoid,
                   "nombre": this.editliceoname[item.order],
                   "moodleuri": this.editmoodleuri[item.order],
                   "servicename": this.editliceoservicename[item.order],
                   "servicetoken": this.editliceoservicetoken[item.order]
                 }

    this.genericServices.POST('/servicios/liceo/updateSchool',data).subscribe(
        data => {
          this.showAlert('Liceo ' + item.nombre + ' actualizado con exito.')
          this.schoolList[item.order].nombre = this.editliceoname[item.order]
          this.schoolList[item.order].moodleuri = this.editmoodleuri[item.order]
          this.schoolList[item.order].servicename = this.editliceoservicename[item.order]
          this.schoolList[item.order].servicetoken = this.editliceoservicetoken[item.order]
          this.resetEditForm();
        },
        error => {
          this.showErrorAlert('Error al actualizar liceo: ' + item.nombre)
        }
   );

  
    
  }
}
