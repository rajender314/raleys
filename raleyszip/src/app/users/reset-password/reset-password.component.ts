import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { UsersService } from '../users.service';
const APP: any = window['APP'];
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent implements OnInit {
  public success = false;
  public image_url = APP.img_url;
  public onceClicked = false;
  constructor(
    private dialogRef: MatDialogRef<ResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private userService: UsersService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {}

  send(form: any): void {
    this.onceClicked = true;
    this.userService
      .resetPassword({
        email: this.data.setData.email,
        password_set: this.data.setData.password_set
      })
      .then(response => {
        if (response.result.success) {
          this.dialogRef.close(response.result);
        }
      });
  }
  close(): void {
    this.dialogRef.close();
  }
}
