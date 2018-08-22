import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'matefun', loadChildren: './matefun/matefun.module#MateFunModule' },
            { path: 'archivos', loadChildren: './archivos/archivos.module#ArchivosModule' },
            { path: 'grupos', loadChildren: './grupos/grupos.module#GruposModule' }            
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
