import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignListComponent } from './campaign-list/campaign-list.component';
import { AgGridModule } from 'ag-grid-angular';
import { PixelKitModule } from 'pixel-kit';
import { SharedModule } from '@app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogsModule } from '@app/dialogs/dialogs.module';

@NgModule({
  imports: [
    CommonModule,
    CampaignsRoutingModule,
    AgGridModule.withComponents([]),
    PixelKitModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DialogsModule
  ],
  declarations: [CampaignListComponent]
})
export class CampaignsModule {}
