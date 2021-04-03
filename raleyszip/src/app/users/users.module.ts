import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { PixelKitModule } from 'pixel-kit';
import { SharedModule } from '@app/shared/shared.module';
import { MatListModule } from '@angular/material/list';
import {
  MatSlideToggleModule,
  MatSelectModule,
  MatStepperModule,
  MatExpansionModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { UserListComponent } from './user-list/user-list.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserFiltersComponent } from './user-filters/user-filters.component';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    PixelKitModule,
    SharedModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatStepperModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule
  ],
  // tslint:disable-next-line:max-line-length
  declarations: [
    UserListComponent,
    UserPermissionsComponent,
    UserDetailComponent,
    AddUserComponent,
    ResetPasswordComponent,
    UserFiltersComponent
  ],
  entryComponents: [
    AddUserComponent,
    ResetPasswordComponent,
    UserFiltersComponent
  ]
})
export class UsersModule {}
