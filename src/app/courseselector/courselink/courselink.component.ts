import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-courselink',
  template: '<a style="background: transparent;color: blue;cursor: pointer;width: 159px;margin-right: 3px;" (click)=selectCourse()>{{text}}</a>',
})
export class CourselinkComponent implements OnInit {
  @Input() courseid: string;
  @Input() roleid: string;
  @Input() text: string;
  returnUrl: string;


  constructor(private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit() {
  	 this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/matefun';
  }

  selectCourse(){
  
    var that = this;
    this.authenticationService.selectUserCourseRole(this.roleid, this.courseid)
        .subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
                //resetSession = true;
                //this.router.navigate([this.returnUrl]);
                //that.sessionService.reset();
            },
            error => {
                //this.loading = false;
                //this.error = true;
                //this.errorText = error.text();
            });


  }

}