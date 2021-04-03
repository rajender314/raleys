import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import { AddSpecsComponent } from '@app/dialogs/add-specs/add-specs.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import * as _ from 'lodash';
import { from } from 'rxjs';
@Component({
  selector: 'app-specifications',
  templateUrl: './specifications.component.html',
  styleUrls: ['./specifications.component.scss']
})
export class SpecificationsComponent implements OnInit, OnChanges {
  @Input() specList;
  public listData: any;
  public formData: any;
  public rowData = [];
  public selectedSpecLabels: any;
  public createSpecs: FormGroup;
  public UIElements = [];
  public specOptions = [];
  public dialogRef: any;
  public controlsChanged = false;
  public previouslySelectedSpec: any;
  public availableOptions: number;
  public submitted = false;
  public fromSpecPage = true;
  public formSpecType = 2; // setting Forms type as default by the value 1.
  public errorMsg: any;
  public statusList = [
    { id: true, name: 'Active' },
    { id: false, name: 'Inactive' }
  ];
  public formSpecTypes = [
    { id: 1, name: 'Form' },
    { id: 2, name: 'Offer Type' }
  ];

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
  public params = {
    column: '',
    pageNumber: 1,
    pageSize: 20,
    search: '',
    sort: 'desc'
  };
  public search = {
    placeHolder: '',
    value: ''
  };
  @ViewChild('searchingBox') searchingBox: ElementRef;

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createSpecFields();
    this.formSpecTypes = [
      { id: 1, name: 'Form ' + this.specList.listFields.value },
      { id: 2, name: 'Offer Type ' + this.specList.listFields.value }
    ];
    this.getUIElements();
    // if (this.rowData.length) {
    // this.getSelectedSpec(this.rowData[0]);
    // this.selectedSpecLabels = this.rowData[0];
    // this.createSpecFields();
    // }
  }
  ngOnChanges(changes) {
    if (this.specList) {
      this.listData = this.specList.listFields;
      this.rowData = this.specList.specFields;
      // this.getSpecificationsList();
      this.selectedSpecLabels = this.rowData[0];
      if (this.rowData.length) {
        this.createSpecFields();
        this.getSelectedSpec(this.rowData[0]);
      }
    }
  }

  getUIElements() {
    this.settingsService.getUIElements('uielements').then(res => {
      this.UIElements = res;
    });
  }
  createSpecFields() {
    this.createSpecs = this.fb.group({
      value: '',
      label: ['', Validators.required],
      status: '',
      tooltip: '',
      ui_element_id: '',
      options: this.fb.array([]),
      id: '',
      key: ''
    });
    this.createSpecs.addControl(
      'settings',
      new FormGroup({
        mandatory: new FormControl(false),
        allow_adding_new_values: new FormControl(false),
        allow_multiple_values: new FormControl(false),
        size: new FormControl(''),
        decimal: new FormControl('')
      })
    );
    this.createFormControls();
  }

  public get options() {
    return this.createSpecs.get('options') as FormArray;
  }

  createFormControls() {
    if (this.selectedSpecLabels) {
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
  }

  getSelectedSpec(data) {
    this.controlsChanged = false;
    this.selectedSpecLabels = data;
    if (
      this.previouslySelectedSpec &&
      this.previouslySelectedSpec.id === data.id
    ) {
      return;
    } else {
      this.previouslySelectedSpec = data;
      const params = {
        spec_id: data.id
      };
      this.search.placeHolder = 'Search ';
      this.settingsService.specDetails(params).then(res => {
        const specDetails = res.result.data.data;
        this.selectedSpecLabels = specDetails;
        data.label = this.selectedSpecLabels.label;
        this.availableOptions = this.selectedSpecLabels.options
          ? this.selectedSpecLabels.options.length
          : 0;
        this.createSpecs.controls.options = this.fb.array([]);
        this.createFormControls();
        this.createSpecs.patchValue({
          value: this.selectedSpecLabels.value,
          label: this.selectedSpecLabels.label,
          status: this.selectedSpecLabels.status,
          tooltip: this.selectedSpecLabels.tooltip,
          ui_element_id: this.selectedSpecLabels.ui_element_id,
          options: this.selectedSpecLabels.options,
          settings:
            this.selectedSpecLabels.settings !== ''
              ? this.selectedSpecLabels.settings
              : false,
          id: this.selectedSpecLabels.id,
          key: this.selectedSpecLabels.key
        });
        this.createSpecs.markAsPristine();
      });
    }
  }
  getSpecsData() {
    const params = {
      pageNumber: 1,
      pageSize: 30
    };
    this.settingsService.getSpects(params).then(res => {
      if (res.result.success) {
        this.rowData = res.result.data.data;
      }
    });
  }
  randomId = () => {
    const rand = Math.random()
      .toString()
      .substr(5);
    return 'new_' + rand;
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

  addControl = (data = {}) => {
    this.options.push(this.createChoice(data));
    this.selectedSpecLabels.options.push(data);
    this.controlsChanged = true;
  };

  removeControl = indx => {
    if (this.options.length > 1) {
      this.options.removeAt(indx);
      this.selectedSpecLabels.options.splice(indx, 1);
    }
    this.controlsChanged = true;
  };

  onScrollDown(evnt) {
    this.params.pageNumber = this.params.pageNumber + 1;
    this.params['form_type'] = this.formSpecType;
    this.getSpecificationsList('page');
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
    if ((form.valid || form.controls['label'].value) && this.options.valid) {
      this.submitted = false;
      this.UIElements.forEach(o => {
        if (o._id === form.controls.ui_element_id.value) {
          if (
            o.key === 'multiple_choice' ||
            o.key === 'dropdown' ||
            o.key === 'checkboxes' ||
            o.key === 'auto_suggest' ||
            o.key === 'radio'
          ) {
            form.value.options = this.options.value.length
              ? this.options.value
              : arr;
          } else {
            form.value.options = [];
          }
        }
      });

      var formValuesWithFormType = _.assign({}, form.value, {
        form_type: this.formSpecType
      });
      this.settingsService.createSpec(formValuesWithFormType).then(response => {
        const result = response.result.data;
        this.errorMsg = result;
        if (response.result.success) {
          this.getSelectedSpec(form.value);
          // this.getSpecsData();
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Spec Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.createSpecs.markAsPristine();
        }
      });
    }
  }

  resetForm(data) {
    this.createSpecs.patchValue({
      value: data.value,
      label: data.label,
      status: data.status,
      tooltip: data.tooltip,
      ui_element_id: data.ui_element_id,
      options: data.options,
      settings: data.settings,
      id: data.id
    });
    this.createSpecs.markAsPristine();
  }

  /* add specs */
  addSpecs = (data?, flag?) => {
    const obj = {
      UIElements: this.UIElements,
      title: flag ? 'Add New Value' : 'Add New Spec',
      flag: flag || '',
      formtype: this.formSpecType,
      fromSpecPage: this.fromSpecPage
    };
    this.dialogRef = this.dialog.open(AddSpecsComponent, {
      panelClass: ['add-edit', 'overlay-dialog'],
      width: '500px',
      data: obj
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Specifications created successfully!'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.rowData.unshift(result.data.data.data);
        this.getSelectedSpec(result.data.data.data);
        // this.settingsService.getSpects(this.params).then(res => {
        //   this.rowData = res.result.data.data;
        // });
      }
    });
  };

  onSearch(event: any): void {
    this.search.value = event;
    this.params.search = this.search.value;
    this.params.pageNumber = 1;
    this.settingsService.getSpects(this.params).then(res => {
      this.rowData = res.result.data.data;
    });
  }

  formSpecTypeChanged(event: any) {
    this.params.pageNumber = 1;
    this.formSpecType = event;
    this.params['form_type'] = this.formSpecType;
    this.getSpecificationsList('init');
    this.rowData = [];
  }

  getSpecificationsList(from) {
    this.settingsService
      .getList([{ url: 'getSpecs' }, this.params])
      .then(res => {
        if (from === 'init') {
          // this.rowData = res.result.data.data;
          _.forEach(res.result.data.data, val => {
            this.rowData.push(val);
          });
          if (this.rowData.length) {
            this.getSelectedSpec(this.rowData[0]);
          }
        } else {
          _.forEach(res.result.data.data, val => {
            this.rowData.push(val);
          });
          console.log(this.rowData);
        }
      });
  }
}
