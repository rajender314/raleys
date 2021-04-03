import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsListComponent } from './settings-list/settings-list.component';

const routes: Routes = [
  {
    path: ':url',
    component: SettingsListComponent
  },
  { path: '', pathMatch: 'full', redirectTo: 'pagetemplates' }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
