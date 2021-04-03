import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { PixelKitModule } from 'pixel-kit';
import * as _ from 'lodash';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { UsersService } from '../users.service';
import { UploaderComponent } from '@app/shared/component/uploader/uploader.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { AppService } from '@app/app.service';
import { CustomValidation } from '@app/shared/utility/custom-validations';

const APP: any = window['APP'];
@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailComponent implements OnInit {
  public dialogRef: any;
  public userDetailForm: FormGroup;
  public submitted = false;
  public userId: any;
  public emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  public default_logo = APP.api_url + 'public/images/default_user.png';
  public formSubmitted = false;
  public loginDetails = JSON.parse(APP.loginDetails);
  public state = {
    submitted: false,
    contact_profile: [
      {
        section: [
          {
            name: 'firstname',
            type: 'text',
            required: true,
            label: 'First Name',
            value: ''
          },
          {
            name: 'lastname',
            type: 'text',
            required: true,
            label: 'Last Name',
            value: ''
          },
          {
            name: 'email',
            type: 'email',
            required: true,
            label: 'Email Address',
            value: ''
          },
          {
            name: 'designation',
            type: 'text',
            required: false,
            label: 'Designation',
            value: ''
          },
          {
            name: 'user_types_id',
            type: 'select',
            required: true,
            label: 'User Role',
            value: '',
            options: 'userTypes'
          },
          {
            name: 'company',
            type: 'select',
            required: true,
            label: 'Company',
            value: '',
            options: 'companies'
          },
          {
            name: 'status',
            type: 'button',
            required: false,
            label: 'Status',
            value: ''
          }
        ]
      }
    ],
    selectedItem: {
      logo: '',
      name: '',
      status: false,
      css: ''
    },
    userTypes: [],
    companies: [],
    userDetails: {}
  };
  @Input() userDetails;
  @Input() submitFlag;
  @Input() saveFlag;
  @Output() detailFormValue = new EventEmitter<any>();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() userImg = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private appService: AppService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getUserTypesAndCompanies();
    this.state.selectedItem = this.userDetails;
    this.state.selectedItem['logo'] = this.userDetails.cloud_path;
    if (this.userDetails.email === this.loginDetails['user_data'].email) {
      this.appService.changeUserData(this.state.selectedItem);
    }
    this.createForm(this.state.contact_profile);
    this.setForm(this.state.selectedItem);
  }

  getUserTypesAndCompanies() {
    return this.userService
      .getUserTypesAndCompanies({
        status: [1]
      })
      .then(res => {
        this.state.userTypes = res.result.data.userTypes;
        this.state.companies = res.result.data.companies;
      });
  }

  editUser(userSection) {
    userSection.edit = true;
    this.setForm(userSection);
  }

  cancelChanges(userSection) {
    userSection.edit = false;
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    if (!this.submitFlag) {
      this.state.selectedItem = this.userDetails;
      this.state.selectedItem['logo'] = this.userDetails.cloud_path;
      if (this.userDetails.email === this.loginDetails['user_data'].email) {
        this.appService.changeUserData(this.state.selectedItem);
      }
      this.createForm(this.state.contact_profile);
      this.setForm(this.state.selectedItem);
      this.cancelChanges(this.userDetails);
    }
  }

  getSelectionData(list, value): any {
    return _.find(this.state[list], function(item) {
      return String(item._id) === String(value);
    });
  }

  createForm(list) {
    this.userDetailForm = this.fb.group({
      firstname: '',
      lastname: '',
      email: '',
      designation: '',
      user_types_id: '',
      company: '',
      status: ''
    });
    const formGroup = {
      id: this.userDetails.id
    };
    list.map(
      function(group) {
        group.section.map(
          function(field) {
            let fieldVal = '';
            if (
              this.userDetailForm &&
              this.userDetailForm.value &&
              this.userDetailForm.value[field.name]
            ) {
              fieldVal = this.userDetailForm.value[field.name];
            } else {
              fieldVal = field.value;
            }
            if (field.required && field.type === 'email') {
              formGroup[field.name] = [
                fieldVal,
                [Validators.required, Validators.pattern(this.emailPattern)]
              ];
            } else if (field.required && field.type === 'text') {
              formGroup[field.name] = [
                fieldVal,
                Validators.compose([
                  Validators.required,
                  CustomValidation.noWhitespaceValidator
                ])
              ];
            } else if (field.required) {
              formGroup[field.name] = [fieldVal, Validators.required];
            } else {
              formGroup[field.name] = fieldVal;
            }
          }.bind(this)
        );
      }.bind(this)
    );
    this.userDetailForm = this.fb.group(formGroup);
    this.userDetailForm.valueChanges.subscribe(() => {
      this.detailFormValue.emit({
        submitted: this.userDetailForm.valid,
        formValues: this.userDetailForm.value
      });
    });
  }

  setForm(data) {
    if (this.userDetailForm) {
      this.userDetailForm.patchValue({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        designation: data.designation,
        user_types_id: data.user_types_id,
        company: data.company,
        status: data.status === 1 ? 'true' : 'false'
      });

      this.userDetailForm.valueChanges.subscribe(() => {
        this.formSubmit.emit({
          edit: true,
          form: this.userDetailForm
        });
      });
    }
  }

  uploadLogo(): void {
    this.dialogRef = this.dialog.open(UploaderComponent, {
      panelClass: ['upload_logo', 'overlay-dialog'],
      width: '500px',
      data: {
        title: 'Upload Photo',
        id: this.state.selectedItem['id'],
        image: this.state.selectedItem['logo'],
        saveUrl: 'uploadLogo',
        removeUrl: 'uploadLogo'
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.state.selectedItem['logo'] = result.fileName;
        if (this.userDetails.email === this.loginDetails['user_data'].email) {
          this.appService.changeUserData(this.state.selectedItem);
        }
        this.userImg.emit(this.state.selectedItem);
      } else if (result && result.remove) {
        this.state.selectedItem['logo'] = '';
      }
    });
  }

  sendEmailConfirmation(): void {
    this.dialogRef = this.dialog.open(ResetPasswordComponent, {
      panelClass: ['my-dialog', 'overlay-dialog'],
      width: '500px',
      data: {
        title:
          this.userDetails.password_set === 1
            ? 'Reset Password'
            : 'Resend Activation Link',
        buttonText:
          this.userDetails.password_set === 1
            ? 'Yes, Reset Password'
            : 'Yes, Resend Activation Link',
        message:
          this.userDetails.password_set === 1
            ? "Password Reset link will be sent to '<b>" +
              this.userDetails.email +
              "</b>'. Are you sure you want to reset your password?"
            : "User activation link will be sent to email '<b>" +
              this.userDetails.email +
              "</b>'. Are you sure you want to resend the activation link?",
        successMessage:
          this.userDetails.password_set === 1
            ? 'Password Reset link is successfully sent to ' +
              this.userDetails.email
            : 'Activation link has been sent to your' +
              this.userDetails.email +
              'address',
        setData: this.userDetails
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg:
              this.userDetails.password_set === 1
                ? 'Password Reset link is successfully sent to ' +
                  this.userDetails.email
                : 'Activation link has been sent to your ' +
                  this.userDetails.email +
                  ' address'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }
}
