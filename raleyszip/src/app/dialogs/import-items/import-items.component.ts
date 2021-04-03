import { Component, OnInit, Inject } from '@angular/core';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
// import { ImportParams } from '@app/shared/utility/types';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar,
  MatDialog
} from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
// import { SkuHistoryComponent } from '../sku-history/sku-history.component';
import { SettingsService } from '@app/settings/settings.service';
// import { ImportSkuComponent } from '../import-sku/import-sku.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import * as moment from 'moment';

const APP: any = window['APP'];

@Component({
  selector: 'app-import-items',
  templateUrl: './import-items.component.html',
  styleUrls: ['./import-items.component.scss'],
  animations: [
    trigger('leftAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class ImportItemsComponent implements OnInit {
  public totalUploadData;
  public submitted = false;
  public disabledOptions = [];
  public displayNone = false;
  public currentState = '';
  public allAutoSizeColumns = [];
  public gridColumnApi;
  public rowData = [];
  public gridApi;
  public toggleClass = true;
  public columnDefs = [];
  public dataLength;
  public impData = {
    samplePath: '',
    url: '',
    title: '',
    format: '',
    container: '',
    fromComp: ''
  };
  public emptyFields = 'update';
  public missingRecords = 'update';
  public;
  public isNxtScreen = false;
  public isPreview = false;
  public dialogRefs: any;
  public fileUploadStatus = false;
  // public progress = false;
  public importData: any;
  public importSkuForm: FormGroup;
  public skuAttributesData: any;
  public selectOptions: any;
  public attrControls: any;
  public progress = false;
  public success = false;
  public minDate;
  public maxDate;
  public minDateValid;
  public maxDateValid;
  public radioGrp1 = [
    {
      format: '',
      key: 'missing_records',
      name: 'Update',
      type: 'radio',
      missing_records: 'update',
      width: 120
    },
    {
      format: '',
      key: 'missing_records',
      name: 'Ignore',
      type: 'radio',
      missing_records: 'ignore',
      width: 120
    }
  ];
  public radioGrp2 = [
    {
      format: '',
      key: 'empty_fields',
      name: 'Update',
      type: 'radio',
      width: 120,
      empty_fields: 'update'
    },
    {
      format: '',
      key: 'empty_fields',
      name: 'Ignore',
      type: 'radio',
      width: 120,
      empty_fields: 'ignore'
    }
  ];
  public storesArr = [];
  public selectedStores = [];
  public params = {
    pageNumber: 1,
    pageSize: '',
    search: '',
    ad_id: ''
  };
  public boxFiles = [];
  public noData = false;
  public progressBox = true;
  public ad_id: any;
  public boxFileSelected = false;
  public selectedBoxFile: any;
  public alreadyBoxImported = false;
  public fetchingBoxFiles = false;
  public importing = false;
  public headersError = false;
  public headersErrorMessage = '';
  public alreadyBoxImportMessage: any;
  public boxErrorMsg = '';
  public previewError = 'No Preview Available';
  public importMsg = 'Items Imported Successfully ';

  public boxParams = {
    ad_id: '',
    box_file_id: '',
    box_file_name: '',
    import: false
  };

  public itemsHistory = [];
  public progressImg = APP.img_url + 'loader.svg';
  public successImg = APP.img_url + 'successIcon.png';
  constructor(
    public dialogRef: MatDialogRef<ImportItemsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private snackbar: MatSnackBar,
    public settingsService: SettingsService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public adsService: AdsService,
    private appService: AppService,
    private dailog: MatDialog
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.impData.samplePath = this.data.samplePath;
    this.impData.title = this.data.title;
    this.impData.format = this.data.format;
    this.impData.container = this.data.container;
    this.impData.url = 'uploadFeatureItems';
    this.impData.fromComp = 'Items';
    this.params.ad_id = this.appService.adId;
    this.dataLength = this.data.length;
    this.currentState = this.data.importFrm;
    if (this.currentState == 'BOX') {
      this.getBoxFiles();
      this.importHistory('getBoxFilesHistory');
    }
    if (this.currentState == 'EXCEL') {
      this.importHistory('getFeatureItemsHistory');
    }
  }
  importHistory(api) {
    this.progress = true;
    this.settingsService.sendOuput(api, this.params).then(res => {
      if (res.result.success) {
        this.itemsHistory = res.result.data.data;
      }
      this.progress = false;
    });
  }
  close = () => {
    this.dialogRef.close({ from: 'close' });
  };
  importSuccess(val) {
    this.progress = !val.status;
    this.dialogRef.close({ from: 'success' });
    this.snackbar.openFromComponent(SnackbarComponent, {
      data: {
        status: 'success',
        msg: this.impData.title + ' Imported Successfully'
      },
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
  importStarts(val) {
    this.progress = !val.status;
  }
  fileUploadStart(val) {
    this.fileUploadStatus = false;
  }
  fileUploadDone(val) {
    this.fileUploadStatus = true;
    this.totalUploadData = val.data;
    if (this.totalUploadData.stores.length) {
      this.createStoresArray();
    }
  }
  nextNav() {
    if (this.data.length) {
      const dialogRef = this.dailog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '500px',
        data: {
          rowData: '',
          selectedRow: { ad_id: this.appService.adId },
          mode: 'import'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'close') {
          this.close();
          return;
        }
        if (this.data.importFrm == 'EXCEL') {
          this.isNxtScreen = true;
          this.isPreview = false;
          this.fileUploadStatus = false;
          this.importData = this.totalUploadData;
          let mindate = this.totalUploadData.dates.min_date;
          let maxdate = this.totalUploadData.dates.max_date;

          // formArray.controls.map(row => {
          //   if (row['controls'].live_dates) {
          //     row.patchValue({ live_dates: data });
          //   }
          // });

          this.minDateValid = moment(mindate);
          this.maxDateValid = moment(maxdate);
          //  console.lo
          // console.log(new Date(2020, 0, 4).toString());
          this.selectOptions = [...this.totalUploadData.column_names];
          this.skuAttributesData = this.totalUploadData.headers;
          this.createImportSkuForm();
          this.createAttributeControls();
        }
        if (this.data.importFrm == 'BOX') {
          this.fileUploadStatus = false;
          this.importBoxFile();
        }
      });
    } else {
      if (this.data.importFrm == 'EXCEL') {
        this.isNxtScreen = true;
        this.isPreview = false;
        this.fileUploadStatus = false;
        this.importData = this.totalUploadData;
        this.selectOptions = [...this.totalUploadData.column_names];
        this.skuAttributesData = this.totalUploadData.headers;
        this.createImportSkuForm();
        this.createAttributeControls();
      }
      if (this.data.importFrm == 'BOX') {
        this.fileUploadStatus = false;
        this.importBoxFile();
      }
    }
  }

  createStoresArray() {
    this.storesArr = [];
    for (let i = 0; i < this.totalUploadData.stores.length; i++) {
      let temp = {
        key: this.totalUploadData.stores[i],
        label: this.totalUploadData.stores[i].toString()
      };
      // if (this.totalUploadData.stores[i] == 420) {
      //   this.selectedStores = [];
      this.selectedStores.push(this.totalUploadData.stores[i]);
      // }
      this.storesArr.push(temp);
      console.log(this.storesArr, this.selectOptions);
    }
  }
  createImportSkuForm() {
    this.importSkuForm = this.fb.group({
      skuAttributes: this.fb.array([])
    });
  }

  public get skuAttributes() {
    return this.importSkuForm.get('skuAttributes') as FormArray;
  }

  createAttributeControls() {
    // console.log(this.importSkuForm)
    // console.log(this.skuAttributes)
    var i = -2;
    this.skuAttributesData.map(attr => {
      // for(var i =0 ;i< this.skuAttributesData.length ; i++){
      this.skuAttributes.push(this.createAttributeGroup(attr, i));
      i++;
      // }
    });

    let data = {
      startDate: this.totalUploadData.dates.min_date,

      endDate: this.totalUploadData.dates.max_date
    };

    this.skuAttributes.controls.map(row => {
      if (row['controls'].key.value == 'end_date_filter') {
        row.patchValue({ selected_field: data });
      } else if (row['controls'].key.value == 'stores_filter') {
        row.patchValue({ selected_field: this.totalUploadData.stores });
      }
    });
  }

  createAttributeGroup(data, idx) {
    const keys = Object.keys(data);
    const controls = {};
    keys.forEach(prop => {
      controls[prop] = data[prop];
    });
    if (idx < this.selectOptions.length) {
      controls['selected_field'] =
        data.mandatory == 1 ? [idx, Validators.required] : idx;
    } else {
      controls['selected_field'] =
        data.mandatory == 1 ? ['', Validators.required] : '';
    }
    this.attrControls = controls;
    // console.log(controls)
    return this.fb.group(controls);
  }

  valChanged(event, key) {
    // console.log(event);
    // // let optionsData = [...this.totalUploadData.column_names];
    // this.selectOptions = [...this.totalUploadData.column_names];
    // let skuAtrArr = event.value.skuAttributes;
    // for (var i = 0; i < this.selectOptions.length; i++) {
    //   if (this.selectOptions[i].inactive) {
    //     this.selectOptions[i].inactive = false;
    //   }
    // }
    // skuAtrArr.map(attr => {
    //   if (attr.selected_field > -1) {
    //     // this.disabledOptions.push(attr.selected_field);
    //     // let optionsData = this.totalUploadData.column_names;
    //     const index = _.findIndex(this.selectOptions, {
    //       key: attr.selected_field
    //     });
    //     if (index > -1) {
    //       if (this.selectOptions[index].inactive) {
    //         this.selectOptions[index].inactive = true;
    //         return;
    //       }
    //       this.selectOptions[index] = Object.assign(this.selectOptions[index], {
    //         inactive: true
    //       });
    //     }
    //     // else{
    //     //   if(this.selectOptions[index].inactive){
    //     //     this.selectOptions[index].inactive = false;
    //     //   }
    //     // }
    //   }
    // });
    // this.selectOptions = optionsData;
  }
  check1(par1, par2) {
    this.emptyFields = par1.empty_fields;
  }
  check2(par1, par2) {
    this.missingRecords = par1.missing_records;
  }
  closeDialog() {
    this.isNxtScreen = false;
    this.isPreview = false;
  }
  viewScreen(form) {
    // console.log(this.importSkuForm)
    this.toggleClass = true;
    this.submitted = true;
    if (form.valid) {
      this.isNxtScreen = false;
      this.isPreview = true;
      this.grid(form);
      this.submitted = false;
      this.rowData = [];
      this.columnDefs = [];
      // this.toggleClass = true;
    }
  }
  grid(form) {
    const headers = {};
    form.value.skuAttributes.map(data => {
      if (data.selected_field >= -1) {
        headers[data.key] = data.selected_field;
      }
      if (data.key == 'stores_filter') {
        this.selectedStores = data.selected_field;
        delete headers['stores_filter'];
      }
      if (data.key == 'end_date_filter') {
        this.minDate = moment(data.selected_field.startDate).format(
          'MM/DD/YYYY'
        );
        this.maxDate = moment(data.selected_field.endDate).format('MM/DD/YYYY');
      }
    });

    const params = {
      filename: this.importData.file.filename,
      original_filename: this.importData.file.original_name,
      headers: headers,
      min_date: this.minDate,
      max_date: this.maxDate,
      stores_filter: this.selectedStores,
      empty_fields: this.emptyFields,
      missing_records: this.missingRecords
    };
    const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
    this.adsService
      .getAdModules([
        { url: 'previewFeatureItems' },
        Object.assign(obj, params)
      ])
      .then(res => {
        this.toggleClass = false;
        if (res.result.success && res.result.data.status) {
          if (res.result.data.data) {
            this.rowData = res.result.data.data;
            this.columnDefs = this.generateColumns(res.result.data.headers);
            // if(!this.rowData.length){
            //   this.previewError = "No Records Found"
            // }
          } else {
            // this.isNxtScreen = true;
            // this.isPreview = false;
            this.previewError = res.result.data.message
              ? res.result.data.message
              : 'No Preview Available';
          }
        } else {
          // this.isNxtScreen = true;
          // this.isPreview = false;
          this.previewError = res.result.data.message
            ? res.result.data.message
            : 'No Preview Available';
        }
      });
  }
  backToScreen() {
    this.isNxtScreen = true;
    this.isPreview = false;
  }
  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['tooltipValueGetter'] = params => params.value;
      temp['enableRowGroup'] = true;
      if (data[i].key === 'store_id') {
        temp['checkboxSelection'] = true;
        temp['headerCheckboxSelection'] = true;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        //   onCellClicked: function(params) {
        //     this.selectedStores(params.data);
        //   }.bind(this),
        this.allAutoSizeColumns.push(data[i].key);
      }

      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    this.toggleClass = false;
    setTimeout(() => {
      this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
    }, 2000);
    // this.gridApi.sizeColumnsToFit();
    // this.toggleClass = false;
  }
  save(form) {
    this.isNxtScreen = true;
    this.isPreview = false;
    this.submitted = true;
    if (form.valid) {
      this.displayNone = true;
      this.progress = true;
      const headers = {};
      form.value.skuAttributes.map(data => {
        if (data.selected_field > -1) {
          headers[data.key] = data.selected_field;
        }
      });

      const params = {
        filename: this.importData.file.filename,
        original_filename: this.importData.file.original_name,
        headers: headers,
        empty_fields: this.emptyFields,
        missing_records: this.missingRecords,
        min_date: this.minDate,
        max_date: this.maxDate,
        stores_filter: this.selectedStores
      };
      this.boxParams.box_file_name = this.importData.file.filename;
      if (this.data.importFrm === 'BOX') {
        this.boxParams = Object.assign(this.boxParams, {
          original_file_name: this.selectedBoxFile.name
        });
      }
      const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
      if (this.data.importFrm === 'EXCEL') {
        this.adsService
          .importFeatureItems(Object.assign(obj, params))
          .then(res => {
            this.importMsg = 'Items Imported Successfully ';
            if (res.result.data.status) {
              this.progress = false;
              this.success = true;
              setTimeout(
                function() {
                  this.success = false;
                  this.dialogRef.close(res.result);
                }.bind(this),
                100
              );
              this.submitted = false;
            } else {
              this.importMsg = res.result.data.message
                ? res.result.data.message
                : 'error occurred while Importing items';
              this.displayNone = false;
              this.progress = false;
              this.success = true;
              setTimeout(
                function() {
                  this.success = false;
                  this.dialogRef.close(res.result);
                }.bind(this),
                100
              );
              this.submitted = false;
            }
          });
      }
      if (this.data.importFrm === 'BOX') {
        this.adsService
          .importBoxFile([
            { url: 'importBoxFile' },
            Object.assign(this.boxParams, { headers: headers, import: true })
          ])
          .then(res => {
            if (res.result.data.status) {
              this.progress = false;
              this.success = true;
              setTimeout(
                function() {
                  this.success = false;
                  this.dialogRef.close(res.result);
                }.bind(this),
                100
              );
              this.submitted = false;
            } else {
              this.displayNone = false;
            }
          });
      }
    }
  }
  getBoxFiles() {
    this.progress = true;
    this.noData = false;
    this.fetchingBoxFiles = true;
    this.adsService
      .displayBoxFiles({ ad_id: this.appService.adId })
      .then(res => {
        if (res.result.success) {
          this.boxFiles = res.result.data.data;
          if (this.boxFiles.length) {
            this.boxFiles.forEach(boxFile => {
              boxFile.selected = false;
            });
            this.noData = false;
            this.progress = false;
          } else {
            this.noData = true;
            this.progress = false;
          }
        }
        this.fetchingBoxFiles = false;
      });
  }

  importBoxFile() {
    this.importing = true;
    this.headersError = false;
    this.fileUploadStatus = false;
    if (this.alreadyBoxImported) {
      this.boxFileSelected = false;
      this.boxParams.ad_id = this.appService.adId;
      this.boxParams.box_file_id = this.selectedBoxFile.id;
      this.boxParams.box_file_name = this.selectedBoxFile.name;
      this.boxParams.import = true;
    } else {
      this.boxParams.ad_id = this.appService.adId;
      this.boxParams.box_file_id = this.selectedBoxFile.id;
      this.boxParams.box_file_name = this.selectedBoxFile.name;
      this.boxParams.import = undefined;
    }
    this.adsService
      .importBoxFile([{ url: 'uploadBoxFile' }, this.boxParams])
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.totalUploadData = res.result.data;
            this.importData = this.totalUploadData;
            this.selectOptions = [...this.totalUploadData.column_names];
            this.skuAttributesData = this.totalUploadData.headers;
            this.createImportSkuForm();
            this.createAttributeControls();
            this.isNxtScreen = true;
            this.isPreview = false;
            this.fileUploadStatus = false;
            if (res.result.data.code === 2) {
              this.headersError = false;
              this.alreadyBoxImported = false;
              this.importing = false;
              // this.snackbar.openFromComponent(SnackbarComponent, {
              //   data: {
              //     status: 'success',
              //     msg: res.result.data.message
              //   },
              //   verticalPosition: 'top',
              //   horizontalPosition: 'right'
              // });
              // this.dialogRef.close({ from: 'open' });
            }
            if (res.result.data.code === 3) {
              this.headersError = true;
              this.headersErrorMessage = res.result.data.message;
              this.importing = false;
            } else {
              this.headersError = false;
              this.importing = false;
              this.alreadyBoxImported = true;
              this.alreadyBoxImportMessage = res.result.data.message;
            }
          } else {
            this.isNxtScreen = false;
            this.isPreview = false;
            this.importing = false;
            this.boxErrorMsg = res.result.data.data
              ? res.result.data.data
              : 'error while fetching items';
          }
        } else {
          this.isNxtScreen = false;
          this.isPreview = false;
          this.importing = false;
          this.boxErrorMsg = res.result.data.data
            ? res.result.data.data
            : 'error while fetching items';
        }
      });
  }

  // close() {
  //   this.dialogRef.close({ from: 'close' });
  // }

  boxFileSelection(boxFile) {
    boxFile.selected = true;
    this.boxErrorMsg = '';
    this.selectedBoxFile = boxFile;
    this.boxFileSelected = true;
    this.fileUploadStatus = true;
  }
}
