import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
// import {
//   MatMenuModule,
//   MatButtonModule,
//   MatFormFieldModule,
//   MatInputModule,
//   MatIconModule,
//   MatProgressSpinnerModule,
//   MatListModule,
//   MatSelectModule,
//   MatBadgeModule,
//   MatDialogModule,
//   MatSnackBarModule,
//   MatChipsModule,
//   MatAutocompleteModule,
//   MatCheckboxModule,
//   MatRadioModule,
//   MatSlideToggleModule,
//   MatTabsModule
// } from '@angular/material';
import { PixelKitModule } from 'pixel-kit';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { SearchComponent } from './search/search.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { UploaderComponent } from './uploader/uploader.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ExcelUploaderComponent } from './excel-uploader/excel-uploader.component';
import { PaginationComponent } from './pagination/pagination.component';
import { StoresComponent } from './stores/stores.component';
import { AgGridModule } from 'ag-grid-angular';
import { AgCustomTemplateComponent } from './ag-custom-template/ag-custom-template.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CustomTooltipComponent } from './custom-tooltip/custom-tooltip.component';
import { NumericEditor } from './CellEditors/numeric-editor.component';
import { PriceEditor } from './CellEditors/price-editor.component';
import { DateEditorComponent } from './CellEditors/date-editor/date-editor.component';
import { OfferUnitCellComponent } from './CellEditors/offer-unit-cell/offer-unit-cell.component';
import { UploadImgComponent } from './upload-img/upload-img.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { AddUserRoleComponent } from './add-user-role/add-user-role.component';
import { ImageEditor } from './CellEditors/image-editor.component';
import { RouteExpiredComponent } from './route-expired/route-expired.component';
import { BuilderComponentsComponent } from './builder-components/builder-components.component';
import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import { ChunkUploaderComponent } from './chunk-uploader/chunk-uploader.component';
import Flow from '@flowjs/flow.js';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    // MatMenuModule,
    // MatButtonModule,
    // MatFormFieldModule,
    // MatInputModule,
    // MatIconModule,
    // MatProgressSpinnerModule,
    // MatListModule,
    // MatSelectModule,
    // MatBadgeModule,
    // MatDialogModule,
    // MatSnackBarModule,
    // MatChipsModule,
    // MatAutocompleteModule,
    // MatCheckboxModule,
    // MatRadioModule,
    // MatSlideToggleModule,
    // MatTabsModule,
    PixelKitModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    AgGridModule.withComponents([CustomTooltipComponent]),
    NgxFlowModule
  ],
  declarations: [
    HeaderComponent,
    SearchComponent,
    SnackbarComponent,
    UploaderComponent,
    ExcelUploaderComponent,
    PaginationComponent,
    StoresComponent,
    AgCustomTemplateComponent,
    PageNotFoundComponent,
    CustomTooltipComponent,
    NumericEditor,
    PriceEditor,
    ImageEditor,
    DateEditorComponent,
    OfferUnitCellComponent,
    UploadImgComponent,
    UserRolesComponent,
    AddUserRoleComponent,
    RouteExpiredComponent,
    BuilderComponentsComponent,
    ChunkUploaderComponent
  ],
  exports: [
    // MatMenuModule,
    // MatButtonModule,
    // MatFormFieldModule,
    // MatInputModule,
    // MatIconModule,
    // MatProgressSpinnerModule,
    // MatListModule,
    // MatSelectModule,
    // MatBadgeModule,
    // MatDialogModule,
    // MatSnackBarModule,
    // MatChipsModule,
    // MatAutocompleteModule,
    // MatCheckboxModule,
    // MatRadioModule,
    // MatSlideToggleModule,
    // MatTabsModule,
    PixelKitModule,
    HeaderComponent,
    ExcelUploaderComponent,
    SearchComponent,
    PaginationComponent,
    StoresComponent,
    // UploaderComponent,
    UploadImgComponent,
    UserRolesComponent,
    ChunkUploaderComponent
  ],
  entryComponents: [
    SnackbarComponent,
    UploaderComponent,
    AgCustomTemplateComponent,
    CustomTooltipComponent,
    NumericEditor,
    PriceEditor,
    ImageEditor,
    DateEditorComponent,
    OfferUnitCellComponent,
    AddUserRoleComponent
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 1500 } },
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
})
export class ComponentModule {}
