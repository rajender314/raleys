import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SaveFilterParams } from '@app/shared/utility/types';
import { UsersService } from '@app/users/users.service';
import { AppService } from '@app/app.service';
import { AdsService } from '@app/ads/ads.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-save-view',
  templateUrl: './save-view.component.html',
  styleUrls: ['./save-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SaveViewComponent implements OnInit {
  public saveFiltersForm: FormGroup;
  public usersList = [];
  public ad_id: string;
  public view_name: string;
  public errorMsg: boolean;
  public errorMessage: string;
  public shareType = 1;
  public type: any;

  public shared_users = [];
  public sharing_types = [
    { label: 'Share this to all Users', value: 1 },
    { label: 'Share with selected Users', value: 2 }
  ];

  public filterParams: SaveFilterParams = {
    name: 'string',
    ad_id: 'string',
    filter_info: [],
    filter_type: 123,
    shared_users: []
  };

  public UiMessages = {
    title: 'save filter view',
    inputPlaceholder:
      this.data.from === 'saveReport'
        ? 'Name of the Report *'
        : 'Name of the View *',
    radioLabel1: 'Share this to all Users',
    radioLabel2: 'Share with selected Users',
    shareWith: 'Share with'
  };

  constructor(
    public dialogRef: MatDialogRef<SaveViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public fb: FormBuilder,
    public userService: UsersService,
    public appService: AppService,
    public adsService: AdsService,
    private snackbar: MatSnackBar
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.getAllUsers();
    this.ad_id = this.appService.adId;
    this.type = this.data.from === 'saveReport' ? 'Report' : 'View';
    if (this.type === 'Report') {
      this.shareType = 3;
    }
  }

  onViewNameChange(param) {
    this.errorMsg = false;
  }

  getAllUsers() {
    this.userService.getUsers({}).then(res => {
      this.usersList = res.result.data;
      const APP: any = window['APP'];
      const loginDetails = JSON.parse(APP.loginDetails);
      const index = _.findIndex(this.usersList, {
        id: loginDetails['user_data'].id
      });
      this.usersList.splice(index, 1);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveViewFilters() {
    const saveViewObj = {
      name: this.view_name,
      ad_id: this.ad_id,
      grid_info: this.data.grid_info,
      filter_type: this.shareType === 3 ? undefined : this.shareType,
      shared_users:
        this.shareType === 3
          ? undefined
          : this.shareType === 1
          ? []
          : this.shared_users
    };

    this.adsService.saveViewFilters([saveViewObj, this.data.from]).then(res => {
      if (res.result.success) {
        this.errorMsg = false;
        this.errorMessage = undefined;
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: this.type + ' Created Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.dialogRef.close({
          data: res,
          from: this.type === 'Report' ? 'report' : undefined
        });
      } else {
        this.errorMsg = true;
        this.errorMessage = res.result.data;
      }
    });
  }
}
