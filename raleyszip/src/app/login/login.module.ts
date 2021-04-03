import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PixelKitModule } from 'pixel-kit';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule,MatSelectModule, MatStepperModule,MatExpansionModule  } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PixelKitModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatStepperModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  declarations: [AdminLoginComponent, ForgotPasswordComponent]
})
export class LoginModule { }
