import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComparisionComponent } from './comparision/comparision.component';

const routes: Routes = [{ path: '', component: ComparisionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileCompRoutingModule {}
