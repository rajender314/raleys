import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PixelKitModule } from 'pixel-kit';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material';
import { SharedModule } from '@app/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { LicenseManager } from 'ag-grid-enterprise';
import { FormsComponent } from './settings-list/forms/forms.component';
import { SpecificationsComponent } from './settings-list/specifications/specifications.component';
import { DialogsModule } from '@app/dialogs/dialogs.module';
import { UserRolesComponent } from './settings-list/user-roles/user-roles.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

LicenseManager.setLicenseKey(
  'Enterpi_Software_Solutions_Private_Limited_MultiApp_1Devs21_August_2019__MTU2NjM0MjAwMDAwMA==f0a6adf3f22452a5a3102029b1a87a43'
);

@NgModule({
  imports: [
    CommonModule,
    PixelKitModule,
    AgGridModule.withComponents([]),
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    SharedModule,
    SettingsRoutingModule,
    DialogsModule,
    InfiniteScrollModule,
    NgxDaterangepickerMd.forRoot()
  ],
  declarations: [
    SettingsListComponent,
    FormsComponent,
    SpecificationsComponent,
    UserRolesComponent
  ]
})
export class SettingsModule {}
