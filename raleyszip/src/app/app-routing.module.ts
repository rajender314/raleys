import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdorderlistComponent } from './adorderlist/adorderlist.component';
import { PageNotFoundComponent } from '@app/shared/component/page-not-found/page-not-found.component';
import { RouteExpiredComponent } from './shared/component/route-expired/route-expired.component';

const routes: Routes = [
  { path: 'users', loadChildren: './users/users.module#UsersModule' },
  {
    path: 'campaigns',
    loadChildren: '@app/campaigns/campaigns.module#CampaignsModule'
  },
  { path: 'events', loadChildren: '@app/events/events.module#EventsModule' },
  {
    path: 'settings',
    loadChildren: '@app/settings/settings.module#SettingsModule'
  },
  {
    path: 'manage-account',
    loadChildren:
      '@app/manage-account/manage-account.module#ManageAccountModule'
  },
  { path: 'vehicles', loadChildren: '@app/ads/ads.module#AdsModule' },
  {
    path: 'compare-files',
    loadChildren: '@app/file-comp/file-comp.module#FileCompModule'
  },
  { path: 'ad-order-list', component: AdorderlistComponent },
  { path: 'access-denied', component: RouteExpiredComponent },
  { path: '', redirectTo: '/vehicles', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
