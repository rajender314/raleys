import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-custom-attributes',
  templateUrl: './custom-attributes.component.html',
  styleUrls: ['./custom-attributes.component.scss']
})
export class CustomAttributesComponent implements OnInit {
  public customAttribsForm: FormGroup;
  public submitted = false;
  public edit = false;
  public two = 2;
  public one = 1;
  public noData = true;
  public labelName: any;
  public errorMsg: any;
  public updatingCustomAttrInfo = false;
  public addingNewAttribute = false;
  public loading = false;
  public currentAttribute: any;
  public search: any;
  public currentAttributeId: any;
  public currentAttributeName: any;
  public rowData = [];
  public statusList = [{ id: 1, name: 'yes' }, { id: 2, name: 'no' }];
  public typesList = [
    { id: 'integer', name: 'integer' },
    { id: 'float', name: 'float' },
    { id: 'text', name: 'text' }
  ];
  constructor(
    private fb: FormBuilder,
    private adsService: AdsService,
    private appService: AppService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<CustomAttributesComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  @ViewChild('searchingBox') searchingBox: ElementRef;

  ngOnInit() {
    this.createForm();
    this.getAllCustomAttributes('');
  }

  createForm(): void {
    this.customAttribsForm = this.fb.group({
      label: ['', Validators.required],
      status: [1, Validators.required],
      type: ['', Validators.required],
      mandatory: 1,
      display_grid: 1
    });
  }

  getAllCustomAttributes(from) {
    this.loading = true;
    let obj = {
      ad_id: this.appService.adId,
      search: from ? from : undefined,
      column: 'last_modified',
      sort: 'desc'
    };
    // setTimeout(() => {
    this.adsService.getCustomAttributes(obj).then(res => {
      this.rowData = res.result.data.data;
      if (this.rowData.length) {
        this.noData = false;
        this.currentAttribute = this.rowData[0];
        this.currentAttributeId = this.rowData[0].id;
        this.currentAttributeName = this.rowData[0].label;
        this.setFormValues(this.rowData[0]);
        this.customAttribsForm.markAsPristine();
      } else {
        this.noData = true;
        this.currentAttributeName = '';
      }
      this.loading = false;
    });
    // }, 3000);
  }

  getCustomAttributes(from) {
    this.loading = true;
    let obj = { ad_id: this.appService.adId, search: from ? from : undefined };
    this.adsService.getCustomAttributes(obj).then(res => {
      this.rowData = res.result.data.data;
      if (this.rowData.length) {
        this.noData = false;
      } else {
        this.noData = true;
      }
      this.loading = false;
    });
  }

  setFormValues(selectedAttribute) {
    this.customAttribsForm.patchValue({
      label: selectedAttribute.label,
      status: selectedAttribute.status,
      type: selectedAttribute.type,
      mandatory: selectedAttribute.mandatory,
      display_grid: selectedAttribute.display_grid
    });
  }

  getSelectedAttr(selectedAttr) {
    this.customAttribsForm.reset();
    this.addingNewAttribute = false;
    this.errorMsg = '';
    this.currentAttribute = selectedAttr;
    this.currentAttributeId = selectedAttr.id;
    this.currentAttributeName = selectedAttr.label;
    this.setFormValues(selectedAttr);
    this.customAttribsForm.markAsPristine();
  }

  saveAttribute(form) {
    this.submitted = true;
    if (form.valid) {
      let finalObj;
      this.loading = true;
      this.updatingCustomAttrInfo = true;
      if (this.addingNewAttribute) {
        // new attriburte case
        this.labelName = form.value.label;
        finalObj = { ad_id: this.appService.adId, ...form.value };
      } else {
        //edit case
        this.labelName = form.value.label;
        finalObj = {
          id: this.currentAttributeId,
          ad_id: this.appService.adId,
          ...form.value
        };
      }

      this.adsService.createCustomAttribute(finalObj).then(res => {
        if (res && res.result.success) {
          this.getAllCustomAttributes('');
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg:
                this.labelName +
                (this.addingNewAttribute ? ' Created ' : ' Updated ') +
                'Successfully.'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.errorMsg = '';
          this.addingNewAttribute = false;
        } else {
          this.addingNewAttribute = true;
          this.errorMsg = res.result.data;
        }
        this.updatingCustomAttrInfo = false;
        this.loading = false;
      });
    }
  }

  cancel() {
    if (this.addingNewAttribute) {
      this.addCustomAttributes();
    } else {
      this.getSelectedAttr(this.currentAttribute);
    }
  }

  close() {
    this.dialogRef.close();
  }

  onSearch(event) {
    this.addingNewAttribute = false;
    this.getAllCustomAttributes(event);
  }

  addCustomAttributes() {
    this.loading = true;
    //  this.searchingBox['searchOpts'].value = '';
    this.addingNewAttribute = true;
    // setTimeout(() => {
    this.loading = false;
    // }, 1000);
    this.submitted = false;
    this.customAttribsForm.reset();
    this.setFormValues({
      label: '',
      status: 1,
      type: 'text',
      mandatory: 1,
      display_grid: 1
    });
    this.customAttribsForm.markAsPristine();
  }
}
