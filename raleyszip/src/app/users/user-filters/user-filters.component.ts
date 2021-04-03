import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { UsersService } from '../users.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PixelKitModule } from 'pixel-kit';
import * as _ from 'lodash';
@Component({
  selector: 'app-user-filters',
  templateUrl: './user-filters.component.html',
  styleUrls: ['./user-filters.component.scss']
})
export class UserFiltersComponent implements OnInit {
  public filtersForm: FormGroup;
  public search = {
    search: ''
  };
  public state = {
    submitted: false,
    list: [
      {
        name: 'user_types_id',
        type: 'auto-suggest',
        required: true,
        label: 'User Role',
        value: '',
        options: 'userTypes'
      },
      {
        name: 'company',
        type: 'auto-suggest',
        required: true,
        label: 'Company',
        value: '',
        options: 'companies'
      },
      {
        name: 'status',
        type: 'auto-suggest',
        required: true,
        label: 'Status',
        value: '',
        options: 'statusList'
      }
    ],
    userTypes: [],
    companies: [],
    statusList: []
  };

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private dialogRef: MatDialogRef<UserFiltersComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.createForm();
    this.setForm(this.data);
    this.search.search = this.data.search;
  }

  createForm() {
    this.filtersForm = this.fb.group({
      user_role: [[]],
      company: [[]],
      status: [[]]
    });
  }

  setForm(data) {
    if (this.filtersForm) {
      let statusVal = data.status.length > 0 ? data.status.split(',') : [];
      if (statusVal.length) {
        var i = 0;
        statusVal.map(val => {
          statusVal[i] = parseInt(val);
          i++;
        });
      }
      this.filtersForm.patchValue({
        user_role:
          data.user_types_id.length > 0 ? data.user_types_id.split(',') : [],
        company: data.company.length > 0 ? data.company.split(',') : [],
        status: statusVal
      });
    }
  }

  closeDialog = () => {
    this.dialogRef.close();
  };

  applyFilters(form) {
    this.userService
      .getUsers(Object.assign({}, form.value, this.search))
      .then(response => {
        if (response.result.success) {
          this.dialogRef.close({
            data: response.result,
            formValue: form.value
          });
        }
        this.state.submitted = false;
      });
  }
}
