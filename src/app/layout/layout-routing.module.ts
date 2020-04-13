import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'matefun', loadChildren: './matefun/matefun.module#MateFunModule' },
            { path: 'archivos', loadChildren: './archivos/archivos.module#ArchivosModule' },
            { path: 'cursos', loadChildren: './cursos/cursos.module#CursosModule' },
            { path: 'actividades', loadChildren: './actividades/actividades.module#ActividadesModule' },
            { path: 'grupos', loadChildren: './grupos/grupos.module#GruposModule' },
            { path: 'ieducativa', loadChildren: './ieducativa/ieducativa.module#IEducativaModule' },
            { path: 'gestcursos', loadChildren: './gestcursos/gestcursos.module#GestcursosModule' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
