import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdsListComponent } from './ads-list/ads-list.component';
import { AdSubModulesComponent } from './ads-list/ad-sub-modules/ad-sub-modules.component';
import { AdOffersComponent } from '@app/ads/ads-list/ad-sub-modules/ad-offers/ad-offers.component';
import { AdDetailsComponent } from '@app/ads/ads-list/ad-sub-modules/ad-details/ad-details.component';
import { AdActivityComponent } from '@app/ads/ads-list/ad-sub-modules/ad-activity/ad-activity.component';
import { AdDesignComponent } from '@app/ads/ads-list/ad-sub-modules/ad-design/ad-design.component';
import { AdPagesComponent } from '@app/ads/ads-list/ad-sub-modules/ad-pages/ad-pages.component';
import { BaseVersionsComponent } from '@app/ads/ads-list/ad-sub-modules/base-versions/base-versions.component';
import { AdPromotionsComponent } from './ads-list/ad-sub-modules/ad-promotions/ad-promotions.component';
import { AdReportsComponent } from './ads-list/ad-sub-modules/ad-reports/ad-reports.component';
import { AdSignageComponent } from './ads-list/ad-sub-modules/ad-signage/ad-signage.component';

const routes: Routes = [
  { path: '', component: AdsListComponent },
  {
    path: ':url',
    component: AdSubModulesComponent,
    children: [
      { path: '', component: AdDetailsComponent },
      { path: 'activity', component: AdActivityComponent },
      { path: 'ad-details', component: AdDetailsComponent },
      { path: 'ad-design', component: AdDesignComponent },
      { path: 'pages', component: AdPagesComponent },
      { path: 'signage', component: AdSignageComponent },
      { path: 'offers', component: AdOffersComponent },
      { path: 'items', component: AdOffersComponent },
      { path: 'base-versions', component: BaseVersionsComponent },
      { path: 'promotions', component: AdPromotionsComponent },
      { path: 'reports', component: AdReportsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdsRoutingModule {}
