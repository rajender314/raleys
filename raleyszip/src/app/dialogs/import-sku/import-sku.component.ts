import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SettingsService } from '@app/settings/settings.service';
const APP: any = window['APP'];
@Component({
  selector: 'app-import-sku',
  templateUrl: './import-sku.component.html',
  styleUrls: ['./import-sku.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportSkuComponent implements OnInit {
  public importData: any;
  public importSkuForm: FormGroup;
  public skuAttributesData: any;
  public selectOptions: any;
  public attrControls: any;
  public progress = false;
  public success = false;

  public progressImg = APP.img_url + 'loader.svg';
  public successImg = APP.img_url + 'successIcon.png';

  constructor(
    private dialogRef: MatDialogRef<ImportSkuComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.importData = this.data.importData;
    this.selectOptions = this.importData.column_names;
    this.skuAttributesData = this.importData.headers;
    this.createImportSkuForm();
    this.createAttributeControls();
  }

  closeDialog = () => {
    this.dialogRef.close();
  };

  createImportSkuForm() {
    this.importSkuForm = this.fb.group({
      skuAttributes: this.fb.array([])
    });
  }

  public get skuAttributes() {
    return this.importSkuForm.get('skuAttributes') as FormArray;
  }

  createAttributeControls() {
    this.skuAttributesData.map(attr => {
      this.skuAttributes.push(this.createAttributeGroup(attr));
    });
  }

  createAttributeGroup(data) {
    const keys = Object.keys(data);
    const controls = {};
    keys.forEach(prop => {
      controls[prop] = data[prop];
    });
    this.attrControls = controls;
    controls['selected_field'] = '';
    return this.fb.group(controls);
  }

  save(form) {
    this.progress = true;
    const headers = {};
    form.value.skuAttributes.map(data => {
      if (data.selected_field) {
        headers[data.key] = data.selected_field;
      }
    });

    const params = {
      filename: this.importData.file.filename,
      original_filename: this.importData.file.original_name,
      headers: headers
    };
    this.settingsService.importSku(params).then(res => {
      if (res.result.data.status) {
        this.progress = false;
        this.success = true;
        setTimeout(
          function() {
            this.success = false;
            this.dialogRef.close(res.result);
          }.bind(this),
          1500
        );
      }
    });
  }
}
