import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CourseSelectorComponent } from './courseselector.component';

const routes: Routes = [
    { path: '', component: CourseSelectorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseSelectorRoutingModule { }
