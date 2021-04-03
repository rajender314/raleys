import {
  Component,
  OnInit,
  ViewEncapsulation,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { SettingsService } from '@app/settings/settings.service';
import { DeleteComponent } from '@app/dialogs/delete/delete.component';
import { AddSpecsComponent } from '../add-specs/add-specs.component';
import * as _ from 'lodash';

// import { FormulaBuilderComponent } from '../formula-builder/formula-builder.component';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditFormComponent implements OnInit {
  public specsList: Array<any> = [];
  public specFields: any;
  public UIElements = [];
  public formData: any;
  public formDataDummy: any;
  public createSpecs: FormGroup;
  public createSampleForms: FormGroup;
  private formId: any;
  private formName: any;
  private formType: number;
  private fromSpecPage = false;
  public mandatory: any;
  public disableBtn = true;
  public progress = false;
  public isNewForm = false;
  public params = {
    column: 'label',
    pageNumber: 1,
    pageSize: 20,
    search: '',
    sort: 'asc',
    status: true,
    form_id: ''
  };
  public search = {
    placeHolder: 'Search',
    value: ''
  };
  sortOptions: any = {
    handle: '.handle',
    onUpdate: (event: any) => {},
    onStart: (event: any) => {
      this.disableBtn = false;
    }
  };
  @ViewChild('searchingBox') searchingBox: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<EditFormComponent>,
    public dialog: MatDialog,
    public formulaDialog: MatDialog,
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.data) {
      this.getFormDetails();
      const data = this.data.formData;
      this.formDataDummy = this.data.formData;
      this.isNewForm = this.data.formData.length ? false : true; // if formData length is zero or if you add/delte spec it is under new.
      this.formData = data;
      this.formId = this.data.id;
      this.formName = this.data.title;
      this.formType = this.data.key === 'OFFER_TYPES' ? 2 : 1;
      this.params.form_id = this.formId;
      this.createSampleForms = this.data.createSampleForms;
      this.getSpecsData();
      this.getUIElements();
    }
  }

  getFormDetails() {
    const params = {
      form_id: this.data.id || ''
    };
    this.settingsService.formDetails(params).then(res => {
      const specData = res.result.data;
      this.formData = specData.specsInfo;
      // console.log(this.createSampleForms);
    });
  }

  getUIElements() {
    this.settingsService.getUIElements('uielements').then(res => {
      this.UIElements = res;
    });
  }

  /* spects form */
  getSpecsData() {
    this.progress = true;
    const params = {
      pageNumber: 1,
      pageSize: 500,
      status: true,
      form_id: this.formId,
      form_type: this.formType
    };
    this.settingsService.getSpects(params).then(res => {
      if (res.result.success) {
        this.specsList = res.result.data.data;
      }
      this.progress = false;
    });
  }
  close = param => {
    this.dialogRef.close({
      form: this.createSampleForms,
      data: this.formData,
      from: param
    });
  };

  /* selected spects */
  getSelectedForm(obj) {
    const params = {
      id: this.formId,
      type: 'add',
      spec_ids: [],
      form_values: {
        id: obj.id,
        value: 'test',
        tooltip: obj.tooltip,
        display_in_grid: obj.display_in_grid || false,
        settings: obj.settings
      },
      name: this.data.title || '',
      key_words: this.data.keyword,
      form_type: this.formType
    };
    params.spec_ids.push(obj.id);
    const index = this.specsList.indexOf(obj);
    this.specsList.splice(index, 1);
    this.settingsService.createForm(params).then(res => {
      const data = res.result.data.specsInfo[0];
      this.formData = this.formData.concat(data);
      (<FormArray>this.createSampleForms.controls.formValues).push(
        this.fb.group({
          [data.label]: ''
        })
      );
      if (this.formData.length === this.formDataDummy.length) {
        this.isNewForm = false;
      } else {
        this.isNewForm = true;
      }
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'success',
          msg: 'Form Spec Added Successfully'
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      // this.dialogRef.close();
    });
  }
  onSearch(event: any): void {
    this.search.value = event;
    this.params.search = this.search.value;
    this.settingsService.getSpects(this.params).then(res => {
      this.specsList = res.result.data.data;
    });
  }

  /* actions */
  perfomAction = (spec, controlName, value, i?) => {
    if (controlName === 'delete') {
      this.deleteSpec(spec, i);
    } else if (controlName === 'mandatory') {
      this.disableBtn = false;
      spec.form_save_value.settings.mandatory = !spec.form_save_value.settings
        .mandatory;
      this.formData.map(o => {
        if (o.id === spec.id) {
          o.form_save_value.settings.mandatory =
            spec.form_save_value.settings.mandatory;
        }
        this.mandatory = o;
      });
    } else if (controlName === 'display') {
      this.disableBtn = false;
      spec.form_save_value.display_in_grid = !spec.form_save_value
        .display_in_grid;
    }
  };

  deleteSpec(data, indx) {
    this.disableBtn = true;
    // const ids = data.map(val => {
    // 	return val.id
    // })
    const ids = [];
    ids.push(data.id);
    const locals = {
      title: 'Remove Form Spec',
      buttons: { save: 'Remove Spec', cancel: 'Cancel' },
      name: data.label,
      params: {
        type: 'delete',
        id: this.formId,
        delete_spec_ids: ids,
        name: this.data.title || '',
        key_words: this.data.keyword
      },
      url: 'createForm'
    };
    this.dialog
      .open(DeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '500px',
        data: locals
      })
      .afterClosed()
      .subscribe(res => {
        if (res && res.success) {
          this.formData.splice(indx, 1);
          if (this.formData.length === this.formDataDummy.length) {
            this.isNewForm = false;
          } else {
            this.isNewForm = true;
          }
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Form Spec Deleted Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.getSpecsData();
        }
      });
  }

  /* save form */

  updateForm = form => {
    this.disableBtn = false;
    const params = {
      id: this.formId,
      spec_ids: [],
      name: this.data.title || '',
      form_values: [] || this.mandatory,
      form_type: this.formType,
      key_words: this.data.keyword
    };
    const arr = [];
    form.forEach(item => {
      params.spec_ids.push(item.id);
      params.form_values.push(item.form_save_value);
    });
    this.settingsService.createForm(params).then(response => {
      if (response.result.success) {
        // this.dialogRef.close({
        //  success:true
        // });
        this.close(1);
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Form Updated Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  };

  addSepcification = (data?, flag?) => {
    const obj = {
      UIElements: this.UIElements,
      title: flag ? 'Add New Value' : 'Add New Spec',
      flag: flag || '',
      formtype: this.formType,
      fromSpecPage: this.fromSpecPage
    };
    const dialogRef = this.dialog.open(AddSpecsComponent, {
      panelClass: ['add-edit', 'overlay-dialog'],
      width: '500px',
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Specifications created successfully!'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.specsList.unshift(result.data.data.data);
        //  this.rowData.unshift(result.data.data.data);
        //  this.getSelectedSpec(result.data.data.data);
        // this.settingsService.getSpects(this.params).then(res => {
        //   this.rowData = res.result.data.data;
        // });
      }
    });
  };
}
