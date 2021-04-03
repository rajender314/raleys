import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLoginComponent } from '@app/login/admin-login/admin-login.component';
import { ForgotPasswordComponent } from '@app/login/forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
