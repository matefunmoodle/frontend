import { Component, OnInit } from '@angular/core';

import { NotificacionService } from '../shared/services/notificacion.service';

import 'rxjs/add/operator/debounceTime';

@Component({
    moduleId: module.id,
    selector: 'notificacion',
    templateUrl: 'notificacion.component.html'
})

export class NotificacionComponent {
    message: any;

    constructor(private notifService: NotificacionService) {
    }

    ngOnInit() {
    	this.notifService.getMessageSubject().subscribe(message => { 
            this.alerts.push(message);
            setTimeout(()=>{
                this.closeAlert(0);//siempre elimino la 0 dado que es la mas antigua que se agrego. 
            }, 5000);
        });
        //Esto es otra forma que lugo de 5 segundos del ultimo mensaje vacia todo el arreglo. 
        // this.notifService.getMessageSubject().debounceTime(5000).subscribe(() => this.alerts = []);

    }

   	public alerts: Array<Object> = [];

	// Alert
	public closeAlert(i:number):void {
		this.alerts.splice(i, 1);
	}

}