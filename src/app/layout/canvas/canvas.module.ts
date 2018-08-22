import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from './canvas.component';

@NgModule({
    imports: [FormsModule, RouterModule, CommonModule, NgbModule],
    declarations: [CanvasComponent],
    exports: [CanvasComponent]
})

export class CanvasModule { }
