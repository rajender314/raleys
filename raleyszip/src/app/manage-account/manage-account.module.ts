import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageAccountRoutingModule } from './manage-account-routing.module';
import { ManageAccountComponent } from './manage-account.component';
import { PixelKitModule } from 'pixel-kit';
import { SharedModule } from '@app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ManageAccountComponent],
  imports: [
    CommonModule,
    ManageAccountRoutingModule,
    PixelKitModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ManageAccountModule {}
