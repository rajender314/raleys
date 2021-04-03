import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PixelKitModule } from 'pixel-kit';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule, MatTooltipModule } from '@angular/material';
import { SharedModule } from '@app/shared/shared.module';
import { AdsRoutingModule } from './ads-routing.module';
import { AdsListComponent } from './ads-list/ads-list.component';
import { LicenseManager } from 'ag-grid-enterprise';
import { AdSubModulesComponent } from './ads-list/ad-sub-modules/ad-sub-modules.component';
import { AdOffersComponent } from './ads-list/ad-sub-modules/ad-offers/ad-offers.component';
import { AdPagesComponent } from './ads-list/ad-sub-modules/ad-pages/ad-pages.component';
import { AdDesignComponent } from './ads-list/ad-sub-modules/ad-design/ad-design.component';
import { GridLayoutDesignerComponent } from './ads-list/ad-sub-modules/grid-layout-designer/grid-layout-designer.component';
import { AdDetailsComponent } from './ads-list/ad-sub-modules/ad-details/ad-details.component';
import { AdActivityComponent } from './ads-list/ad-sub-modules/ad-activity/ad-activity.component';
import { BaseVersionsComponent } from './ads-list/ad-sub-modules/base-versions/base-versions.component';
import { AdPromotionsComponent } from './ads-list/ad-sub-modules/ad-promotions/ad-promotions.component';
import { DialogsModule } from '@app/dialogs/dialogs.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AdReportsComponent } from './ads-list/ad-sub-modules/ad-reports/ad-reports.component';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AdSignageComponent } from './ads-list/ad-sub-modules/ad-signage/ad-signage.component';

LicenseManager.setLicenseKey(
  'Enterpi_Software_Solutions_Private_Limited_MultiApp_1Devs21_August_2019__MTU2NjM0MjAwMDAwMA==f0a6adf3f22452a5a3102029b1a87a43'
);

@NgModule({
  declarations: [
    AdsListComponent,
    AdSubModulesComponent,
    AdOffersComponent,
    AdPagesComponent,
    AdDesignComponent,
    GridLayoutDesignerComponent,
    AdDetailsComponent,
    AdActivityComponent,
    BaseVersionsComponent,
    AdPromotionsComponent,
    AdReportsComponent,
    AdSignageComponent
  ],

  imports: [
    CommonModule,
    PixelKitModule,
    AgGridModule.withComponents([]),
    FormsModule,
    DialogsModule,
    ReactiveFormsModule,
    SharedModule,
    AdsRoutingModule,
    MatTreeModule,
    InfiniteScrollModule,
    MatTooltipModule,
    NgxMatDrpModule,
    NgxDaterangepickerMd.forRoot()
  ]
})
export class AdsModule {}
