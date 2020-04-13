import { Component, OnInit } from '@angular/core';
import { MoodleService } from '../../shared/services/moodle.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  moduleId: module.id,
  selector: 'gestcursos',
  templateUrl: './gestcursos.component.html',
  styleUrls: ['./gestcursos.component.scss']
})

export class GestcursosComponent implements OnInit {


  constructor(private moodleService: MoodleService, private authenticationService: AuthenticationService) { }

  ngOnInit() {
  	

  }


}
