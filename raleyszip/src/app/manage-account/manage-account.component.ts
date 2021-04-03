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
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';
import { MatSnackBar, MatDialog } from '@angular/material';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { UploaderComponent } from '@app/shared/component/uploader/uploader.component';
import { AppService } from '@app/app.service';
import { UsersService } from '@app/users/users.service';
const APP: any = window['APP'];

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: ['./manage-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class ManageAccountComponent implements OnInit {
  public dialogRef: any;
  public userDetails: FormGroup;
  public changePwd: FormGroup;
  public errorMsg: any;
  public url = APP.api_url;
  public submitted = false;
  public userDisable = true;
  public companies = [];
  public pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/;
  public params = {
    status: 1
  };
  public state: any = {};
  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private userService: UsersService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getLoginDetails();
    this.createForm();
    this.getCompany();
  }

  tabChanged(indx) {
    this.submitted = false;
    this.errorMsg = '';
    if (indx.index === 1) {
      this.changePwd.markAsPristine();
    } else {
      this.setForm(this.state);
    }
  }
  getLoginDetails() {
    return this.appService.getLoginDetails(this.params).then(res => {
      this.state = res.result.data[0];
      this.setForm(this.state);
    });
  }

  createForm = () => {
    this.userDetails = this.fb.group({
      id: '',
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: '',
      designation: '',
      company: ''
    });
    this.changePwd = this.fb.group(
      {
        id: '',
        current_password: ['', Validators.required],
        password: [
          null,
          Validators.compose([
            Validators.required,
            // this.patternValidator(/^[a-zA-Z0-9]{8,20}$/, {
            //   minLength: true
            // }),
            // this.patternValidator(/^[a-zA-Z0-9_@./#&+-]{8,20}$/, {
            //   minLength: true
            // }),
            Validators.minLength(8),
            Validators.maxLength(20),
            this.patternValidator(/\d/, {
              hasNumber: true
            }),
            this.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            this.patternValidator(/[a-z]/, {
              hasSmallCase: true
            })
            // this.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
            //   hasSpecialCharacters: true
            // })
            // Validators.minLength(8)
          ])
        ],
        confirm_password: [
          '',
          [Validators.required] //, Validators.pattern(this.pwdPattern)
        ]
      },
      {
        validator: this.passwordMatchValidator
      }
    );
  };
  setForm(data) {
    this.userDetails.patchValue({
      id: this.state.id,
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      email: this.state.email,
      designation: this.state.designation,
      company: this.state.company
    });
  }
  /* custom validations */
  patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

  /* pattern regex matching */
  passwordMatchValidator(frm: FormGroup) {
    return frm.controls['password'].value ===
      frm.controls['confirm_password'].value
      ? null
      : { mismatch: true };
  }

  onKey(event) {
    this.userDisable = false;
  }
  getCompany = () => {
    return this.userService.getUserTypesAndCompanies(this.params).then(res => {
      this.companies = res.result.data.companies;
    });
  };

  uploadLogo(): void {
    this.dialogRef = this.dialog.open(UploaderComponent, {
      panelClass: ['upload_logo', 'overlay-dialog'],
      width: '500px',
      data: {
        title: 'Upload Photo',
        id: this.state.id,
        image: this.state.cloud_path,
        saveUrl: 'uploadLogo',
        removeUrl: 'uploadLogo'
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.state.cloud_path = result.fileName;
        this.appService.changeUserData(this.state);
      } else if (result && result.remove) {
        this.state.cloud_path = '';
      }
    });
  }

  saveChanges(form) {
    this.submitted = true;
    if (form.valid) {
      this.submitted = false;
      this.userService.saveUser(form.value).then(res => {
        if (res.result.success) {
          this.errorMsg = '';
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'User Details Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.userDisable = true;
        } else {
          this.errorMsg = res.result.data;
        }
      });
    }
  }

  savePwd(form) {
    form.value.id = this.state.id;
    this.submitted = true;
    if (form.valid) {
      this.submitted = false;
      this.userService.registerUser(form.value).then(res => {
        if (res.result.success) {
          this.errorMsg = '';
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Password Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          window.location.href = this.url + '#/vehicles';
        } else {
          this.errorMsg = res.result.data[0];
        }
      });
    }
  }
}
