import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MateFunComponent } from './matefun.component';

const routes: Routes = [
    { path: '', component: MateFunComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MateFunRoutingModule { }