import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PixelKitModule } from 'pixel-kit';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { UsersService } from '../users.service';
import * as _ from 'lodash';
import { CustomValidation } from '@app/shared/utility/custom-validations';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  public createUserForm: FormGroup;
  public companies: any;
  public userTypes: any;
  public emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  public state = {
    submitted: false,
    searchForm: [
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
      }
    ],
    list: [
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
      { name: 'designation', type: 'text', label: 'Designation', value: '' },
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
      }
    ],
    userTypes: [],
    companies: [],
    userDetails: {}
  };
  public errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.createForm(this.data.searchForm);
    if (this.data) {
      this.state.userTypes = this.data.userTypes;
      this.state.companies = this.data.companies;
    }
  }

  createForm(list) {
    this.createUserForm = this.fb.group({
      id: 0,
      firstname: '',
      lastname: '',
      email: '',
      designation: '',
      user_types_id: '',
      company: ''
    });
    const formGroup = {};
    _.map(list, field => {
      let fieldVal = '';
      if (
        this.createUserForm &&
        this.createUserForm.value &&
        this.createUserForm.value[field.name]
      ) {
        fieldVal = this.createUserForm.value[field.name];
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
    });
    this.createUserForm = this.fb.group(formGroup);
  }

  closeDialog = () => {
    this.dialogRef.close();
  };
  saveDetails(form: any): void {
    this.errorMsg = '';
    this.state.submitted = true;
    if (form.valid) {
      this.userService.saveUser(form.value).then(response => {
        if (response.result.success) {
          this.state.userDetails = response.result.data;
          this.dialogRef.close(response.result);
        } else {
          this.errorMsg = response.result.message;
          this.state.userDetails = {};
        }
        this.state.submitted = false;
      });
    }
  }
}
