import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { SettingsService } from '@app/settings/settings.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-specs',
  templateUrl: './add-specs.component.html',
  styleUrls: ['./add-specs.component.scss']
})
export class AddSpecsComponent implements OnInit {
  public addSpec: FormGroup;
  public errorMsg: any;
  public submitted = false;
  public limitValues: any;
  public UIElements = [];
  public statusList = [
    { id: true, name: 'Active' },
    { id: false, name: 'Inactive' }
  ];
  public formTypes = [{ id: 1, name: 'Forms' }, { id: 2, name: 'Offer Types' }];

  public editSpecsForm: FormGroup;

  public formKey: any;
  public editSpecMode = false;
  public addSpecMode = true;
  public selectedSpecLabels: any;
  public formCategories = [];
  public availableOptions: number;

  public sizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];
  public decimalDigits = [
    { id: '0', name: '0' },
    { id: '1', name: '1' },
    { id: '2', name: '2' },
    { id: '3', name: '3' },
    { id: '4', name: '4' },
    { id: '5', name: '5' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private settingsService: SettingsService,
    private dialogRef: MatDialogRef<AddSpecsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.data = data;
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.createForm();
    this.setForm();
    this.UIElements = this.data.UIElements;
    this.getValue(this.data.UIElements[0].key);

    //edit section
    this.createEditSpecFields();
    this.getUIElements();
  }
  close = () => {
    this.dialogRef.close();
  };
  createForm() {
    this.addSpec = this.fb.group({
      label: ['', Validators.required],
      status: '',
      ui_element_id: '',
      form_type: ['', Validators.required]
    });
    this.addSpec.addControl(
      'limits',
      new FormGroup({
        min_limit: new FormControl(false),
        max_limit: new FormControl(false),
        max_length: new FormControl(false)
      })
    );
  }

  setForm() {
    this.addSpec.patchValue({
      label: '',
      status: true,
      ui_element_id: this.data.UIElements[0]._id,
      form_type: this.data.formtype
    });
  }
  getValue(id) {
    this.UIElements.forEach(item => {
      if (id === item._id) {
        this.limitValues = item.key;
      }
    });
  }
  save(form) {
    let obj;
    if (
      this.limitValues === 'multiple_choice' ||
      this.limitValues === 'dropdown'
    ) {
      obj = [
        {
          id: 0,
          status: '',
          value: ''
        }
      ];
    } else {
      obj = [];
    }
    const settings = {
      mandatory: false,
      allow_adding_new_values: false,
      allow_multiple_values: false,
      limit_values: form.value['limits']
    };
    const params = {
      label: form.value['label'],
      status: form.value['status'],
      ui_element_id: form.value['ui_element_id'],
      settings: settings,
      options: obj,
      form_type: form.value['form_type']
    };
    this.submitted = true;
    if (form.valid) {
      this.submitted = false;
      this.settingsService.createSpec(params).then(response => {
        if (response.result.success) {
          this.dialogRef.close({
            data: response.result,
            formValue: form.value
          });
          // this.selectedSpecLabels = response.result.data;
          // this.availableOptions = this.selectedSpecLabels.options
          //   ? this.selectedSpecLabels.options.length
          //   : 0;
          // this.addSpecMode = false;
          // this.editSpecMode = true;
        } else {
          this.errorMsg = response.result.data;
          // this.error = true;
        }
      });
    }
  }

  // editing specs code

  getUIElements() {
    this.settingsService.getUIElements('uielements').then(res => {
      this.UIElements = res;
    });
  }

  createForms() {
    this.addSpec = this.fb.group({
      name: ['', Validators.required],
      status: '',
      form_assign_id: [
        '',
        this.formKey === 'OFFER_TYPES' ? '' : Validators.required
      ]
    });
  }

  createEditSpecFields() {
    this.editSpecsForm = this.fb.group({
      value: '',
      label: ['', Validators.required],
      status: '',
      tooltip: '',
      ui_element_id: '',
      options: this.fb.array([]),
      id: '',
      key: ''
    });

    this.editSpecsForm.addControl(
      'settings',
      new FormGroup({
        mandatory: new FormControl(false),
        allow_adding_new_values: new FormControl(false),
        allow_multiple_values: new FormControl(false),
        size: new FormControl(''),
        decimal: new FormControl('')
      })
    );
    // this.createFormControls();
  }

  public get options() {
    return this.editSpecsForm.get('options') as FormArray;
  }

  createFormControls() {
    this.selectedSpecLabels.options.map(attr => {
      const controls = {};
      Object.keys(attr).forEach(o => {
        if (o === 'value') {
          controls[o] = [attr[o], Validators.required];
        } else {
          controls[o] = attr[o];
        }
      });
      this.options.push(this.fb.group(controls));
    });
  }

  saveDetails(form) {
    this.submitted = true;
    const arr = [],
      obj = {
        id: 0,
        status: '',
        value: ''
      };
    arr.push(obj);
    if (form.valid && this.options.valid) {
      this.submitted = false;
      this.UIElements.forEach(o => {
        if (o._id === form.controls.ui_element_id.value) {
          if (
            o.key === 'multiple_choice' ||
            o.key === 'dropdown' ||
            o.key === 'checkboxes' ||
            o.key === 'auto_suggest'
          ) {
            form.value.options = this.options.value.length
              ? this.options.value
              : arr;
          } else {
            form.value.options = [];
          }
        }
      });
      this.settingsService.createSpec(form.value).then(response => {
        const result = response.result.data;
        this.errorMsg = result;
        if (response.result.success) {
          // this.getSelectedSpec(form.value);
          // this.getSpecsData();
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Spec Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.editSpecsForm.markAsPristine();
        }
      });
    }
  }

  addControl = (data = {}) => {
    this.options.push(this.createChoice(data));
    this.selectedSpecLabels.options.push(data);
  };

  createChoice = (data?) => {
    const obj: any = {};
    obj.value =
      data && data.value
        ? [data.value, Validators.required]
        : ['', Validators.required];
    return this.fb.group({
      id: data && data.id ? data.id : this.randomId(),
      status: data ? data.status : true,
      ...obj
    });
  };

  randomId = () => {
    const rand = Math.random()
      .toString()
      .substr(5);
    return 'new_' + rand;
  };

  removeControl = indx => {
    if (this.options.length > 1) {
      this.options.removeAt(indx);
      this.selectedSpecLabels.options.splice(indx, 1);
    }
  };
}
