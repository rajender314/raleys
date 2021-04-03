import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageAccountComponent } from './manage-account.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ManageAccountComponent },
  { path: 'manage-account', component: ManageAccountComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageAccountRoutingModule {}
