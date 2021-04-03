import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@app/shared/material/material.module';
import { MatListModule } from '@angular/material/list';
import { PixelKitModule } from 'pixel-kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditCampaignComponent } from './edit-campaign/edit-campaign.component';
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component';
import { AddEditSettingsComponent } from './add-edit-settings/add-edit-settings.component';
import { SkuHistoryComponent } from './sku-history/sku-history.component';
import { ConfirmEditLabelComponent } from './confirm-edit-label/confirm-edit-label.component';
import { ImportSkuComponent } from './import-sku/import-sku.component';
import { EditFormComponent } from './edit-form/edit-form.component';
import { SharedModule } from '@app/shared/shared.module';
import { AddformComponent } from './addform/addform.component';
import { AddSpecsComponent } from './add-specs/add-specs.component';
import { DeleteComponent } from './delete/delete.component';
import { CreateAdComponent } from './create-ad/create-ad.component';
import { AgGridModule } from 'ag-grid-angular';
import { MatSlideToggleModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SortablejsModule } from 'angular-sortablejs';
import { AddStoresComponent } from './add-stores/add-stores.component';
import { ShowMailComponent } from './show-mail/show-mail.component';
import { ImageAssestsComponent } from './image-assests/image-assests.component';
import { PromtionsViewComponent } from './promtions-view/promtions-view.component';
import { SaveViewComponent } from './save-view/save-view.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AdPreviewComponent } from './ad-preview/ad-preview.component';
import { CustomAttributesComponent } from './custom-attributes/custom-attributes.component';
import { ImportItemsComponent } from './import-items/import-items.component';
import { FormulaBuilderComponent } from './formula-builder/formula-builder.component';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatExpansionModule } from '@angular/material/expansion';
import { FileUploadModule } from 'ng2-file-upload';

import {
  EditModComponent,
  NumbersOnlyDirective,
  PriceOnlyDirective,
  BlockCopyPasteDirective,
  TwoDigitDecimaNumberDirective,
  NumericDirective,
  ModFilterPipe,
  NgInitDirective
} from './edit-mod/edit-mod.component';
import { SplitModComponent } from './split-mod/split-mod.component';
import { EditSignageComponent } from './edit-signage/edit-signage.component';
import { CreateSignageComponent } from './create-signage/create-signage.component';
import { CreateEmptySignageComponent } from './create-empty-signage/create-empty-signage.component';
import { CreatePromotionsComponent } from './create-promotions/create-promotions.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MatListModule,
    PixelKitModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    SharedModule,
    AgGridModule.withComponents([]),
    InfiniteScrollModule,
    MatExpansionModule,
    // NgxSortableModule
    SortablejsModule.forRoot({ animation: 150 }),
    NgxMatDrpModule,
    NgxDaterangepickerMd.forRoot(),
    FileUploadModule
  ],
  declarations: [
    EditCampaignComponent,
    ConfirmDeleteComponent,
    AddEditSettingsComponent,
    SkuHistoryComponent,
    ConfirmEditLabelComponent,
    ImportSkuComponent,
    EditFormComponent,
    AddformComponent,
    AddformComponent,
    AddSpecsComponent,
    DeleteComponent,
    CreateAdComponent,
    AddStoresComponent,
    ShowMailComponent,
    ImageAssestsComponent,
    PromtionsViewComponent,
    SaveViewComponent,
    AdPreviewComponent,
    CustomAttributesComponent,
    ImportItemsComponent,
    FormulaBuilderComponent,
    EditModComponent,
    NumbersOnlyDirective,
    PriceOnlyDirective,
    BlockCopyPasteDirective,
    TwoDigitDecimaNumberDirective,
    NumericDirective,
    NgInitDirective,
    ModFilterPipe,
    SplitModComponent,
    EditSignageComponent,
    CreateSignageComponent,
    CreateEmptySignageComponent,
    CreatePromotionsComponent
  ],
  entryComponents: [
    EditCampaignComponent,
    ConfirmDeleteComponent,
    AddEditSettingsComponent,
    SkuHistoryComponent,
    ConfirmEditLabelComponent,
    ImportSkuComponent,
    EditFormComponent,
    AddformComponent,
    AddSpecsComponent,
    DeleteComponent,
    CreateAdComponent,
    AddStoresComponent,
    ShowMailComponent,
    ImageAssestsComponent,
    PromtionsViewComponent,
    SaveViewComponent,
    AdPreviewComponent,
    CustomAttributesComponent,
    ImportItemsComponent,
    SplitModComponent,
    CreateSignageComponent,
    CreateEmptySignageComponent,
    CreatePromotionsComponent
  ],
  exports: [FormulaBuilderComponent, EditModComponent, EditSignageComponent]
})
export class DialogsModule {}
