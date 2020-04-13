import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActividadesComponent } from './actividades.component';

const routes: Routes = [
	{ path: '', component: ActividadesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActividadesRoutingModule { }
