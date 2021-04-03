import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatSnackBar,
  MatDatepicker
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { $ } from 'protractor';
import { SettingsService } from '@app/settings/settings.service';
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';

const APP: any = window['APP'];

@Component({
  selector: 'app-create-signage',
  templateUrl: './create-signage.component.html',
  styleUrls: ['./create-signage.component.scss']
})
export class CreateSignageComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreateSignageComponent>,
    private adsService: AdsService,
    private appService: AppService,
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  public image_url = APP.img_url;
  public deptList = [];
  public selectedDepartment = [];
  public selectedUpcs = [];
  public rowData = [];
  public allAutoSizeColumns = [];
  public noData = false;
  public dataLoad = true;
  public rowSelection = 'multiple';
  public currentUrl = '';
  public skuGridFlag = '';
  public showSkuSearch = true;

  public search = {
    placeHolder: 'Search...',
    value: ''
  };
  public columnDefs = [];
  public boltIcon = APP.img_url + 'bolticon.svg';
  public gridApi: any;
  public gridColumnApi: any;
  public gridVisibility = false;
  public pointerEvents = false;
  public disableBtn = true;
  public fromComp = '';
  public loadingMsg = 'Loading Please Wait...';
  public impId = '';
  public btnText = 'Create Signage';
  public subscription: any;
  public searchparams = {
    search: this.selectedUpcs,
    pageNumber: 1,
    pageSize: 30,
    dept_group: [],
    upcs: [],
    end_date: '',
    ad_id: this.appService.adId,
    state: this.data.from,
    import_ad_id: this.fromComp != 'upc-search' ? this.impId : '',
    flag: this.fromComp != 'sign-search' ? 'create_signage' : 'signages',
    sku: null,
    selected_ad_id: '',
    site: this.selectedUpcs
  };
  public updateProg = true;
  public dateRange = {
    start_date: '',
    end_date: ''
  };
  public endDate = '';
  public endDate1 = '';
  public readonlyMode = false;
  public totCount;
  public showDateImg = true;
  public showPromoPage = true;
  public showBackBtn = false;
  public allowNextFun = true;
  public resetFieldVal = false;
  public signIdArray = [];
  public qty_3x8;
  public qty_5x3_5;
  public qty_7x11;
  public promoSku = '';
  public skuNo;
  public showDateRange = false;
  public skuArray = [];
  public array = [];
  public array2 = [];
  public array3 = [];

  public minDate = {
    live_dates: moment(new Date()),
    start_date: new Date(),
    end_date: '',
    break_date: moment(new Date()).add(1, 'days')['_d'],
    first_proof: moment(new Date()).add(1, 'days')['_d'],
    second_proof: moment(new Date()).add(1, 'days')['_d'],
    final_proof: moment(new Date()).add(1, 'days')['_d']
  };
  public maxDate = {
    live_dates: moment(new Date()).add(15, 'days'),
    start_date: '',
    end_date: '',
    break_date: '',
    first_proof: '',
    second_proof: '',
    final_proof: ''
  };
  public disableStatus = {
    start_date: false,
    end_date: false,
    break_date: true,
    first_proof: true,
    second_proof: true,
    final_proof: true,
    first_proof_date: false,
    second_proof_date: true,
    third_proof_date: true
  };
  range: Range = { fromDate: new Date(), toDate: new Date() };
  rangeOptions: NgxDrpOptions;
  presets: Array<PresetItem> = [];
  @ViewChild('dateRangePicker') dateRangePicker;

  ngOnInit() {
    // console.log(this.data);

    this.fromComp = this.data.from;

    if (this.fromComp == 'ads-search') {
      this.searchparams.flag = '';
    }
    // console.log(this.data);
    this.signIdArray.push(this.data.signId);
    // console.log(this.data);
    if (this.fromComp != 'blank-ads' && this.data.promoFrom != 'promoSku') {
      this.deptList = this.data.deptList.slice(1);
      // console.log(this.deptList)
      this.readonlyMode = false;
      // console.log(this.btnText);
    }
    if (this.fromComp == 'blank-ads') {
      this.deptList = this.data.deptList;
      // console.log(this.deptList)
      this.loadingMsg = 'Loading Please Wait...';

      this.readonlyMode = this.data.blankVal;
      // this.btnText = 'Add Promotion';

      this.selectedDepartment.push(this.data.deptId);
    }
    if (this.data.from == 'upc-search') {
      this.btnText = 'Create Signage';
      this.search.placeHolder = 'Search UPC / SKU ...';
      this.loadingMsg =
        'Please select Department and search for UPCs for related promotions';
      // this.getPromoData('');
    }
    if (this.data.promoFrom == 'promoSku') {
      this.noData = false;
      this.dataLoad = true;
      this.search.placeHolder = 'Search with Site...';
      this.loadingMsg = 'Please Enter SKU No';
      this.showPromoPage = false;
      this.btnText = 'Next';

      this.skuArray = this.data.skuValues.split(',');
      // console.log(this.skuArray)
      this.skuNo = this.data.skuValues;

      for (let i = 0; i < this.skuArray.length; i++) {
        //  let array = []

        // let a = parseInt(this.skuArray[i]);
        // console.log(a)

        this.array.push(parseInt(this.skuArray[i]));
      }
      // console.log(this.array);

      this.searchparams.sku = this.array;
      this.searchparams.flag = 'ads_list';

      // if (this.searchparams.sku != '') {
      setTimeout(() => {
        // this.getAdsFromSku();
        this.update();
      }, 100);
      // }
    }
    if (this.data.from != 'upc-search' && this.data.promoFrom != 'promoSku') {
      this.search.placeHolder = 'Search Ads ...';
      this.btnText = 'Next';
      setTimeout(() => {
        this.getVehicles();
      }, 100);
      setTimeout(() => {
        this.loadingMsg = 'Please select Department';
      }, 1000);
    }
  }

  getAdsFromSku() {
    // let searchparams = {
    //   ad_id: this.appService.adId,
    //   pageNumber: this.data.pageNumber,
    //   pageSize: this.data.pageSize,
    //   flag: "ads_list",
    //   sku: this.promoSku

    // }

    // this.searchparams.sku = this.promoSku;

    this.rowData = [];
    this.noData = false;
    this.dataLoad = true;
    this.gridVisibility = false;
    this.pointerEvents = false;
    this.rowSelection = 'single';
    this.disableBtn = true;

    // this.searchparams.search = this.selectedUpcs;
    if (this.searchparams.flag == 'promotions_list') {
      this.searchparams.site = this.selectedUpcs;
    } else {
      this.searchparams.search = this.selectedUpcs;

      // console.log(this.noData,  this.dataLoad)
      if (this.searchparams.search == [] || (!this.noData && this.dataLoad)) {
        this.disableBtn = true;
      }
    }

    // if(this.skuNo == '') {
    //   this.noData = false;
    //   this.dataLoad = true;
    //   this.loadingMsg = 'enter'
    // }

    delete this.searchparams.end_date;
    delete this.searchparams.dept_group;
    delete this.searchparams.import_ad_id;
    delete this.searchparams.upcs;

    this.getData('searchPromotionsOnSKU', this.btnText);
  }
  onDeptChanged(ev) {
    this.dataLoad = true;
    this.noData = false;
    this.loadingMsg = 'Loading Please Wait...';
    this.getPromoData('');
  }
  onSearch(ev) {
    // console.log(ev)
    this.noData = true;
    this.dataLoad = true;
    this.noData = false;
    this.loadingMsg = 'Loading Please Wait...';
    this.selectedUpcs = this.data.from == 'upc-search' ? ev.split(/[,;]+/) : ev;
    // console.log(this.data);
    if (this.data.promoFrom == 'promoSku') {
      // console.log(this.data);

      this.selectedUpcs = ev;

      this.getAdsFromSku();
    }
    if (this.data.from != 'upc-search' && this.data.promoFrom != 'promoSku') {
      this.getVehicles();
    } else if (
      this.data.from == 'upc-search' &&
      this.data.promoFrom != 'promoSku'
    ) {
      this.getPromoData('');
    }
  }
  close() {
    this.dialogRef.close();
  }

  update() {
    if (this.data.from != 'upc-search' && this.allowNextFun) {
      this.search.placeHolder = 'Search UPC / SKU ...';
      this.updateProg = false;
      this.search.value = 'upcs';
      this.disableBtn = true;
      this.loadingMsg = 'Please select Department';
      // console.log(this.data.from)
      this.btnText =
        this.readonlyMode == true ? 'Add Promotion' : 'Create Signage';
      if (this.data.promoFrom != 'promoSku') {
        this.impId = this.gridApi.getSelectedRows()[0].id;
        this.showBackBtn = true;
      }

      // console.log(this.resetFieldVal);

      if (this.resetFieldVal && this.readonlyMode == false) {
        this.selectedDepartment = [];
        this.endDate1 = '';
        this.showDateImg = true;
        this.showPromoPage = true;

        this.qty_3x8 = '';
        this.qty_5x3_5 = '';
        this.qty_7x11 = '';
        this.impId = this.gridApi.getSelectedRows()[0].id;
      }

      if (this.readonlyMode || (this.resetFieldVal && this.readonlyMode)) {
        this.dataLoad = true;
        this.loadingMsg = 'Loading Please Wait...';
        this.endDate1 = '';
        this.showDateImg = true;
        this.showPromoPage = true;

        this.qty_3x8 = '';
        this.qty_5x3_5 = '';
        this.qty_7x11 = '';
        this.impId = this.gridApi.getSelectedRows()[0].id;
      }

      if (this.data.promoFrom == 'promoSku') {
        this.dataLoad = true;
        this.loadingMsg = 'Loading Please Wait...';
        this.showBackBtn = false;
        this.showDateRange = true;
        this.showPromoPage = false;
        this.noData = false;
        this.btnText = 'Add Promotion';
        this.showSkuSearch = false;
        this.search.placeHolder = 'Search with Site...';

        this.searchparams.flag = 'promotions_list';
        this.updateProg = false;

        // this.impId = this.gridApi.getSelectedRows()[0].id;
        this.searchparams.selected_ad_id = this.impId;

        this.getPromoData2(this.gridApi.getSelectedRows());

        // setTimeout(() => {
        //   this.getAdsFromSku();
        // }, 100);
        // this.getPromoData2();
      }
      this.data.from = 'upc-search';
      this.selectedUpcs = [];

      this.allowNextFun = false;
      setTimeout(() => {
        this.search.value = '';
        if (this.fromComp != 'sign-search') {
          this.updateProg = true;
        }
      }, 100);
      if (this.data.promoFrom != 'promoSku') {
        this.getPromoData(this.gridApi.getSelectedRows());
      }

      return;
    } else {
      // console.log('crtesign');

      this.createSignage();
    }
  }
  valChangedQty(event, qty) {
    if (qty == 'qty_3x8') {
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');

      this.qty_3x8 = event.target.value;
    }
    if (qty == 'qty_5x3_5') {
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');

      this.qty_5x3_5 = event.target.value;
    }
    if (qty == 'qty_7x11') {
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');

      this.qty_7x11 = event.target.value;
    }

    if (qty == 'sku_no') {
      // event.target.value = event.target.value.replace(/[^0-9]*/g, '');
      // console.log(event.target.value)
      this.array = [];
      this.array.push(event.target.value);
      this.array2 = this.array[0].split(',');

      this.array3 = [];
      this.array2.forEach(obj => {
        this.array3.push(parseInt(obj));
      });

      // console.log(this.array3);
      this.searchparams.sku = this.array3;
      // console.log(this.searchparams.sku)
      // setTimeout(() => {

      if (this.skuNo != '') {
        this.noData = false;
        this.dataLoad = true;
        this.loadingMsg = 'Loading Please Wait...';
      } else {
        this.noData = false;
        this.dataLoad = true;
        this.loadingMsg = 'Please Enter SKU No';
      }
      // if (this.skuNo != '') {

      this.getAdsFromSku();
      // }
      // }, 100);
    }
  }
  createSignage() {
    let params = {
      ad_id: this.appService.adId,
      promotion_ids: this.gridApi
        .getSelectedRows()
        .map(row => row.unique_dept_key),
      flag: this.fromComp == 'sign-search' ? 'signage' : 'promotions',
      qty_3x8: this.qty_3x8,
      qty_5x3_5: this.qty_5x3_5,
      qty_7x11: this.qty_7x11,
      signage_ids: this.gridApi.getSelectedRows().map(row => row.id),
      // min_date: this.dateRange.start_date,
      // max_date: this.dateRange.end_date,
      promotion_id: null,
      import_promotion_id: null,
      mod_id: null,
      import_mod_id: null
    };

    // console.log(params.promotion_ids)
    if (this.data.blankVal == true) {
      params.flag = 'import_items';
      params.signage_ids = this.signIdArray;

      this.settingsService
        .deleteItem([{ url: 'createSignage' }, params])
        .then(result => {
          // console.log(result.result.success);
          if (result.result.success) {
            // console.log(result)
            // result.data.data.promo_id;
            if (result.result.data.status) {
              // this.close();
              this.dialogRef.close({
                success: true,
                res: result,
                index: this.data.index
              });
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Promotion created Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              // this.router.navigateByUrl(
              //   '/vehicles/' + this.appService.adId + '/signage'
              // );
            } else {
              this.dialogRef.close();
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: 'Error while creating signage'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            }
          }
        });
    } else if (this.data.promoFrom == 'promoSku') {
      params.flag = 'promotions_list';
      delete params.signage_ids;
      delete params.promotion_ids;
      params.mod_id = this.data.modId;
      params.import_mod_id = this.gridApi.getSelectedRows()[0].mod_id;

      this.settingsService
        .deleteItem([{ url: 'updateModDetailsOnSKU' }, params])
        .then(result => {
          if (result.result.success) {
            // console.log(result)
            // result.data.data.promo_id;
            if (result.result.data.status) {
              // this.close();
              this.dialogRef.close({
                success: true,
                res: result,
                index: this.data.index
              });
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Promotion created Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              // this.router.navigateByUrl(
              //   '/vehicles/' + this.appService.adId + '/signage'
              // );
            } else {
              this.dialogRef.close();
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: 'Error while creating signage'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            }
          }
        });
    } else {
      // create Signage call
      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '500px',
        data: {
          rowData: { label: 'Signage', delete_api: 'createSignage' },
          selectedRow: params,
          mode: 'Create Signage'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.success) {
          // console.log(result)
          // result.data.data.promo_id;
          if (result.data.status) {
            this.dialogRef.close({ success: true });
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Signage created Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            // this.router.navigateByUrl(
            //   '/vehicles/' + this.appService.adId + '/signage'
            // );
          } else {
            this.dialogRef.close();
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Error while creating signage'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
      });
    }
  }

  getPromoData2(data) {
    let deptNames = [];
    this.rowData = [];

    this.rowSelection = 'single';

    this.noData = false;
    this.dataLoad = true;
    this.gridVisibility = false;
    this.pointerEvents = false;

    this.searchparams.selected_ad_id = this.impId;
    this.searchparams.import_ad_id = '';
    this.searchparams.flag = 'promotions_list';

    this.getData('searchPromotionsOnSKU', this.btnText);
  }
  getPromoData(data) {
    let deptNames = [];
    this.rowData = [];

    if (this.fromComp == 'blank-ads' || this.data.promoFrom == 'promoSku') {
      this.rowSelection = 'single';
    } else {
      this.rowSelection = 'multiple';
    }
    this.noData = false;
    this.dataLoad = true;
    this.gridVisibility = false;
    this.pointerEvents = false;
    if (
      !this.selectedDepartment.length &&
      !this.selectedUpcs.length &&
      this.fromComp == 'upc-search'
    ) {
      this.loadingMsg =
        'Please select Department and search for UPC / SKU for related promotions';
      return;
    } else if (
      !this.selectedDepartment.length &&
      (this.selectedUpcs.length == 1 && this.selectedUpcs[0] == '')
    ) {
      this.loadingMsg =
        'Please select Department and search for UPC / SKU for related promotions';

      return;
    }
    if (!this.selectedDepartment.length) {
      this.loadingMsg = 'Please select Department';
      this.disableBtn = true;
      return;
    } else {
      // console.log(this.selectedDepartment)
      this.selectedDepartment.map(dept => {
        const index = _.findIndex(this.deptList, { id: dept });
        if (index > -1) {
          if (dept != 'ALL') {
            deptNames.push(
              this.deptList[index].dept_code +
                ':' +
                ' ' +
                this.deptList[index].name
            );
          }
        }
      });
    }
    if (this.fromComp == 'upc-search') {
      if (
        !this.selectedUpcs.length ||
        (this.selectedUpcs.length == 1 && this.selectedUpcs[0] == '')
      ) {
        this.loadingMsg = 'Please search for UPC / SKU for Promotions';
        return;
      }
    }
    var params = {
      dept_group: deptNames,
      upcs: this.selectedUpcs,
      ad_id: this.appService.adId,
      state: this.data.from,
      end_date: this.endDate,

      import_ad_id: this.fromComp != 'upc-search' ? this.impId : '',
      flag: this.fromComp != 'sign-search' ? 'create_signage' : 'signages',
      page: '',
      perPage: ''
    };
    this.searchparams.dept_group = deptNames;
    this.searchparams.end_date = this.endDate;
    this.searchparams.upcs = this.selectedUpcs;
    this.searchparams.import_ad_id =
      this.fromComp != 'upc-search' ? this.impId : '';
    this.searchparams.flag =
      this.fromComp != 'sign-search' ? 'promotions' : 'signages';
    this.searchparams.flag =
      this.fromComp != 'sign-search' ? 'promotions' : 'signages';
    this.getData('searchSignagePromotions', '');
    // console.log(params);
    // return;
    // this.adsService.sendOuput('searchSignagePromotions', params).then(res => {
    //   this.rowData = res.result.data.data;
    //   if (this.rowData.length) {
    //     this.noData = false;
    //   } else {
    //     this.noData = true;
    //     this.dataLoad = false;
    //   }
    //   this.columnDefs = this.generateColumns(res.result.data.headers);
    // });
  }
  getVehicles() {
    this.rowData = [];
    this.noData = false;
    this.dataLoad = true;
    this.gridVisibility = false;
    this.pointerEvents = false;
    this.rowSelection = 'single';
    var params = {
      search: this.selectedUpcs
    };
    // console.log(params);
    // return;
    this.searchparams.search = this.selectedUpcs;
    this.getData('getVehicles', '');
    // this.adsService.sendOuput('getVehicles', params).then(res => {
    //   this.rowData = res.result.data.data;
    //   if (this.rowData.length) {
    //     this.noData = false;
    //   } else {
    //     this.noData = true;
    //     this.dataLoad = false;
    //   }
    //   let checkbox = {
    //     name: '',
    //     key: 'checkbox',
    //     width: 100,
    //     type: 'checkbox',
    //     format: '',
    //     mandatory: 0
    //   };
    //   res.result.data.headers.push(checkbox);
    //   this.columnDefs = this.generateColumns(res.result.data.headers);
    // });
  }
  generateColumns(data: any[]) {
    // console.log('111111111');
    const columnDefinitions = [];
    this.allAutoSizeColumns = [
      'promo_id',
      'version',
      'cig',
      'div_id',
      'page',
      'mod',
      'flag',
      'unit',
      'method',
      'qty_lim',
      'feature_code',
      'regular_price',
      'regular_qty',
      'site',
      'ca_crv',
      'ad_start_date',
      'status'
    ];
    if (this.data.from != 'upc-search') {
      let checkbox = {
        name: '',
        key: 'checkbox1',
        width: 100,
        type: 'checkbox',
        format: '',
        mandatory: 0
      };
      data.push(checkbox);
    }
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['tooltipValueGetter'] = params => params.value;

      if (data[i].key === 'image') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` + params.data
              ? params.data.image
              : '' + `">`
            : '';
        };
        temp['valueGetter'] = params => {
          let dummyJson = {
            id: params.data ? params.data.id : '',
            col: 'image'
          };
          return JSON.stringify(dummyJson);
        };
        temp['keyCreator'] = params => {
          try {
            var parsed = JSON.parse(params.value);
          } catch (e) {
            // Oh well, but whatever...
          }

          //  let parseVal = params.newValue ? parsed : params.newValue;
          let idx1 = _.findIndex(this.rowData, {
            id: parsed ? parsed.id : params.value
          });
          if (idx1 > -1) {
            return this.rowData[idx1].image;
          } else {
            return params.value;
          }
        };
      } else if (data[i].key === 'logos') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.data.logos +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          let dummyJson = {
            id: params.data.id,
            col: 'logos'
          };
          return JSON.stringify(dummyJson);
        };
        temp['keyCreator'] = params => {
          try {
            var parsed = JSON.parse(params.value);
          } catch (e) {
            // Oh well, but whatever...
          }

          //  let parseVal = params.newValue ? parsed : params.newValue;
          let idx1 = _.findIndex(this.rowData, {
            id: parsed ? parsed.id : params.value
          });
          if (idx1 > -1) {
            return this.rowData[idx1].logos;
          } else {
            return params.value;
          }
        };
      } else {
        if (data[i].key === 'flag') {
          temp['headerName'] = data[i].name;
          temp['field'] = data[i].key;
          temp['pinned'] = 'left';
          temp['cellRenderer'] = params => {
            const imageSrc = this.adsService.getImage(params.value);
            return params.value
              ? `<img class="img-responsive offer-img" src= "` + imageSrc + `">`
              : '';
          };
        }
        if (data[i].key === 'promo_id') {
          temp['headerName'] = data[i].name;
          temp['field'] = data[i].key;
          temp['cellRenderer'] = params => {
            if (params.data) {
              if (
                params.data.flag != 'deleted' &&
                params.data.isUpcExists == 1
              ) {
                return params.value
                  ? `<span>` +
                      params.value +
                      `<span>` +
                      ` <img class="img-responsive offer-img m-r7a" src="` +
                      this.boltIcon +
                      `">`
                  : '';
              } else {
                return params.value;
              }
            } else {
              return params.value;
            }
          };
          temp['pinned'] = 'left';
        }
        if (data[i].key === 'upc') {
          temp['headerName'] = data[i].name;
          temp['field'] = data[i].key;
          temp['cellRenderer'] = params => {
            return params.value;
          };
        }
        if (data[i].key === 'status' && this.data.from != 'upc-search') {
          temp['keyCreator'] = (params: {
            value: { color: string; background: string; code: string };
          }) => {
            return params.value.code;
          };
          temp['cellRenderer'] = (params: {
            value: { color: string; background: string; code: string };
          }) => {
            return params.value
              ? `<div class="background"><span style="color:` +
                  params.value.color +
                  `;background:` +
                  params.value.background +
                  `">` +
                  params.value.code +
                  `</span></div>`
              : '';
          };
        }
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
      }
      // const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = false;
      if (temp['editable'] && !temp['cellClass']) {
        temp['cellClass'] = 'editable_cells';
      }
      // navIdx > -1 ? '' : this.arrangables.push(temp['key']);

      // if (data[i].type !== 'text') {
      //   this.allAutoSizeColumns.push(data[i].key);
      // }
      if (data[i].type === 'image') {
        temp['tooltipComponent'] = 'customTooltipComponent';
        // temp['suppressKeyboardEvent'] = this.suppressEnter;
      }
      if (data[i].type === 'number') {
        temp['cellEditor'] = 'numericEditor';
      } else if (data[i].type === 'price') {
        temp['cellEditor'] = 'priceEditor';
      } else if (data[i].type === 'date') {
        temp['cellEditor'] = 'dateEditor';
        temp['cellRenderer'] = params => {
          if (params.value) {
            let val = params.value.split(',');
            return moment(val[0]).format('MM-DD-YYYY');
          }
        };
        temp['keyCreator'] = (params: { value: moment.MomentInput }) => {
          return moment(params.value).format('MM-DD-YYYY');
        };
      } else if (data[i].type === 'image') {
        temp['cellEditor'] = 'imageEditor';
      }

      if (data[i].type === 'select') {
        temp['cellClass'] = 'editable_cells';
        temp['cellEditor'] = 'offerUnitCellRenderer';
        temp['onCellValueChanged'] = params => {
          if (document.querySelector('.pi-select-list')) {
            document.body.removeChild(
              document.querySelector('.pi-select-list')
            );
          }
        };
        temp['cellRenderer'] = params => {
          if (params.value) {
            return params.value;
          }
        };
      }
      // checkbox adding as first column
      if (data[i].type === 'checkbox') {
        if (this.fromComp != 'blank-ads' && this.data.promoFrom != 'promoSku') {
          temp['checkboxSelection'] = true;
          temp['headerCheckboxSelection'] = false;
          temp['headerCheckboxSelectionFilteredOnly'] = true;
          temp['pinned'] = 'left';
          temp['cellClass'] =
            this.data.from != 'upc-search' ? 'custom-radio' : 'agCheckBox';

          temp['suppressKeyboardEvent'] = true;
        } else if (this.data.promoFrom == 'promoSku') {
          temp['checkboxSelection'] = true;
          temp['headerCheckboxSelection'] = false;
          temp['headerCheckboxSelectionFilteredOnly'] = true;
          temp['pinned'] = 'left';
          temp['cellClass'] = 'custom-radio';

          temp['suppressKeyboardEvent'] = true;
        } else {
          temp['checkboxSelection'] = true;
          temp['headerCheckboxSelection'] = false;
          temp['headerCheckboxSelectionFilteredOnly'] = true;
          temp['pinned'] = 'left';
          temp['cellClass'] = 'custom-radio';

          temp['suppressKeyboardEvent'] = true;
        }
      }
      if (data[i].type !== 'text' && data[i].key != 'sku_no') {
        this.allAutoSizeColumns.push(data[i].key);
      }
      // temp['cellStyle'] = params => {
      //   if (this.newTriggerClr && params.value != this.lastEditBfVal) {
      //     return { backgroundColor: '#fff1c1' };
      //   }
      // };
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();

    window.onresize = () => {
      // this.gridApi.sizeColumnsToFit();
    };
    setTimeout(() => {
      // this.dataLoad = false;
      // this.gridVisibility = true;
      // setTimeout(() => {
      //   this.pointerEvents = true;
      // }, 1800);
      // this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
    }, 200);
  }
  onRowSelected(ev) {
    if (this.data.totalSignages && this.data.totalSignages.length) {
      let index = _.findIndex(this.data.totalSignages, {
        unique_dept_key: ev.data.unique_dept_key
      });
      if (index > -1) {
        ev.node.setSelected(false);
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Signage already exists for the selected promotion'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
    }

    if (this.gridApi.getSelectedRows().length) {
      this.disableBtn = false;
    } else {
      this.disableBtn = true;
    }
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }

  dateValueChange(field, event) {
    //  console.log(field, event)
    // let a =  (<HTMLInputElement>document.getElementById("11"))
    //     console.log( a.getElementsByTagName('INPUT')[0] );

    this.endDate = moment(event.value).format('MM/DD/YYYY');

    this.getPromoData('');
    this.showDateImg = false;
  }

  dateValueChange2(event) {
    // console.log(event)
    this.dateRange.start_date = moment(event.startDate).format('MM/DD/YYYY');
    this.dateRange.end_date = moment(event.endDate).format('MM/DD/YYYY');

    // console.log(this.dateRange)
  }

  // importSkuPromo() {

  //   this.getData('importPromotionsOnSKU');
  // }
  clearDate(e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();

    this.showDateImg = true;
    this.endDate = '';
    this.endDate1 = '';
    this.getPromoData('');
  }
  getData(url, btntext) {
    if (url == 'getVehicles' && this.fromComp == 'sign-search') {
      this.searchparams.flag = 'create_signage';
    } else if (url == 'getVehicles' && this.fromComp == 'blank-ads') {
      this.searchparams.flag = '';
    }
    let dataSource = {
      this: this,
      rowCount: null,
      getRows: function(params) {
        // if(this.callProg){
        //   return ;
        // }
        // this.callProg = true;
        setTimeout(function() {
          dataSource.this.searchparams.pageNumber = Math.floor(
            params.endRow / 30
          );
          dataSource.this.subscription = dataSource.this.adsService
            .sendOuputSubscription(url, dataSource.this.searchparams)
            .subscribe(response => {
              // this.callProg = false;
              // console.log(response)
              if (response['result'].success) {
                this.data = response['result'].data.data;
                this.totCount = response['result'].data.count;

                dataSource.this.rowData = response['result'].data.data;
                if (response['result'].data.items == 0) {
                } else {
                  // dataSource.this.noUsers = false;
                }

                if (params.startRow === 0) {
                  if (dataSource.this.data.title == 'Add Promotion') {
                    if (dataSource.this.skuGridFlag != btntext) {
                      dataSource.this.columnDefs = dataSource.this.generateColumns(
                        response['result'].data.headers
                      );
                    }
                    dataSource.this.skuGridFlag = btntext;
                  } else {
                    if (dataSource.this.currentUrl != url) {
                      dataSource.this.columnDefs = dataSource.this.generateColumns(
                        response['result'].data.headers
                      );
                      // console.log(dataSource.this.columnDefs)
                    }
                  }
                  dataSource.this.currentUrl = url;
                  dataSource.this.gridApi.setColumnDefs(
                    dataSource.this.columnDefs
                  );
                  if (dataSource.this.rowData.length) {
                    // console.log(dataSource.this.rowData)

                    dataSource.this.noData = false;
                  } else {
                    dataSource.this.noData = true;
                    dataSource.this.gridVisibility = false;
                    // dataSource.this.dataLoad = false;
                  }
                  setTimeout(() => {
                    if (!dataSource.this.noData) {
                      dataSource.this.dataLoad = false;
                      dataSource.this.gridVisibility = true;
                    }
                    dataSource.this.dataLoad = false;
                    setTimeout(() => {
                      dataSource.this.pointerEvents = true;
                      // dataSource.this.gridApi.forEachNode(node =>
                      //   node.rowIndex ? 0 : node.setSelected(true)
                      // );
                    }, 800);
                  }, 100);
                  if (dataSource.this.data.from != 'upc-search') {
                    dataSource.this.gridColumnApi.autoSizeColumns(
                      dataSource.this.allAutoSizeColumns
                    );
                    dataSource.this.gridApi.sizeColumnsToFit();
                  } else {
                    dataSource.this.gridColumnApi.autoSizeColumns(
                      dataSource.this.allAutoSizeColumns
                    );
                  }
                }
                var allUsers = response['result'].data.data;
                var totalUsers = response['result'].data.count;
                let pgSize =
                  allUsers.length == dataSource.this.searchparams.pageSize
                    ? dataSource.this.searchparams.pageSize *
                      (dataSource.this.searchparams.pageNumber + 1)
                    : dataSource.this.searchparams.pageSize *
                        (dataSource.this.searchparams.pageNumber - 1) +
                      allUsers.length;
                params.successCallback(allUsers, pgSize);
                // dataSource.this.userSpinner = false;
              } else {
                // dataSource.this.userSpinner = true;
              }
            });
        }, 500);
      }
    };
    // console.log(dataSource)

    this.gridApi.setDatasource(dataSource);
  }

  backToAds() {
    this.search.placeHolder = 'Search Ads ...';
    this.updateProg = false;
    this.loadingMsg = 'Loading Please Wait...';
    this.selectedUpcs = [];
    this.searchparams.search = [];
    this.searchparams.site = [];
    this.searchparams.upcs = [];

    if (this.data.promoFrom == 'promoSku') {
      this.searchparams.flag = 'ads_list';
      this.showDateRange = false;
      this.showSkuSearch = true;

      // this.skuNo = '';
      // this.searchparams.sku = '';
      this.search.value = '';

      setTimeout(() => {
        this.getAdsFromSku();
        this.updateProg = true;
      }, 100);
    } else {
      setTimeout(() => {
        this.getVehicles();
        this.updateProg = true;
      }, 100);
    }
    // this.data.from = 'ads-search';
    this.allowNextFun = true;
    this.btnText = 'Next';
    this.showPromoPage = false;
    this.data.from = '';

    this.resetFieldVal = true;

    this.showBackBtn = false;
    // this.update();
  }
}
