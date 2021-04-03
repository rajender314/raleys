import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-addform',
  templateUrl: './addform.component.html',
  styleUrls: ['./addform.component.scss']
})
export class AddformComponent implements OnInit {
  public addForm: FormGroup;
  public errorMsg: any;
  public formKey: any;
  public submitted = false;
  public tagsList = '';
  public formCategories = [];
  public divsionsForOfferTypes = [];
  public statusList = [
    { id: true, name: 'Active' },
    { id: false, name: 'Inactive' }
  ];
  public params = {
    column: '',
    pageNumber: 1,
    pageSize: 20,
    form_type: 2,
    search: '',
    sort: 'asc'
  };
  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private settingsService: SettingsService,
    private dialogRef: MatDialogRef<AddformComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.formCategories = this.data.categories;
    this.formKey = this.data.listData['key'];
    this.createForms();
    this.setForm();
    this.getDivisions();
  }

  createForms() {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      status: '',
      form_assign_id: [
        '',
        this.formKey === 'OFFER_TYPES' ? '' : Validators.required
      ],
      key_words: ['', this.formKey != 'OFFER_TYPES' ? '' : '']
      // division_id: [
      //   '',
      //   this.formKey === 'OFFER_TYPES' ? Validators.required : ''
      // ]
    });
  }

  valChanged(event) {
    if (event.data === ' ') {
      this.tagsList = event.target.value + '|';
    }
  }
  close = () => {
    this.dialogRef.close();
  };
  setForm() {
    this.addForm.patchValue({
      name: '',
      status: true,
      form_assign_id: ''
    });
  }

  save(form) {
    var formData = form.value;
    form.value.key_words = form.value.key_words.split('|');
    formData['form_type'] = this.formKey === 'OFFER_TYPES' ? 2 : 1;
    this.submitted = true;
    if (form.valid) {
      this.submitted = false;
      this.settingsService.createForm(form.value).then(response => {
        if (response.result.success) {
          this.dialogRef.close({
            data: response.result,
            formValue: form.value
          });
        } else {
          this.errorMsg = response.result.data;
          // this.error = true;
        }
      });
    }
  }

  getDivisions() {
    if (this.formKey === 'OFFER_TYPES') {
      this.params.form_type = 2;
    } else {
      this.params.form_type = 1;
    }
    this.settingsService
      .getList([{ url: 'getDivisions' }, this.params])
      .then(res => {
        this.divsionsForOfferTypes = res.result.data.data;
      });
  }
}
