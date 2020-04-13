import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IEducativaComponent } from './ieducativa.component';

const routes: Routes = [
	{ path: '', component: IEducativaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IEducativaRoutingModule { }
