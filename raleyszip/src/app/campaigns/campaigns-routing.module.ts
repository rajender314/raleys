import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CampaignListComponent } from '@app/campaigns/campaign-list/campaign-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: CampaignListComponent },
  { path: 'campaigns', component: CampaignListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignsRoutingModule {}
