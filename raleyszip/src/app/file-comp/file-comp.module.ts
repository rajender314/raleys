import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileCompRoutingModule } from './file-comp-routing.module';
import { ComparisionComponent } from './comparision/comparision.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [ComparisionComponent],
  imports: [CommonModule, FileCompRoutingModule, SharedModule]
})
export class FileCompModule {}
