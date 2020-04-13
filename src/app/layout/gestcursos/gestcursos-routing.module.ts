import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestcursosComponent } from './gestcursos.component';

const routes: Routes = [
	{ path: '', component: GestcursosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestcursosRoutingModule { }
