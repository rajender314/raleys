import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MatSnackBar,
  MAT_DIALOG_DATA
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';

const APP: any = window['APP'];

@Component({
  selector: 'app-create-promotions',
  templateUrl: './create-promotions.component.html',
  styleUrls: ['./create-promotions.component.scss']
})
export class CreatePromotionsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreatePromotionsComponent>,
    private adsService: AdsService,
    private appService: AppService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  public deptList = [];
  public selectedDepartment = [];
  public selectedUpcs = [];
  public rowData = [];
  public allAutoSizeColumns = [];
  public noData = false;
  public dataLoad = true;
  public rowSelection = 'multiple';
  public currentUrl = '';
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
    ad_id: this.appService.adId,
    state: this.data.from,
    import_ad_id: this.fromComp != 'upc-search' ? this.impId : '',
    flag: this.fromComp != 'sign-search' ? 'promotions' : 'signages'
  };
  public updateProg = true;
  ngOnInit() {
    this.fromComp = this.data.from;
    console.log(this.data);
    if (this.fromComp != 'blank-ads') {
      this.deptList = this.data.deptList.slice(1);
    } else {
      // this.selectedDepartment = this.data.selectedDepartment;
    }
    if (this.data.from == 'upc-search') {
      this.btnText = 'Create Signage';
      this.search.placeHolder = 'Search UPC / SKU ...';
      // this.loadingMsg =
      //   'Please select Department and search for UPCs for related promotions';
      this.getPromoData('');
    } else {
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
  onDeptChanged(ev) {
    this.dataLoad = true;
    this.noData = false;
    this.loadingMsg = 'Loading Please Wait...';
    this.getPromoData('');
  }
  onSearch(ev) {
    this.noData = true;
    this.dataLoad = true;
    this.noData = false;
    this.loadingMsg = 'Loading Please Wait...';
    this.selectedUpcs = this.data.from == 'upc-search' ? ev.split(/[,;]+/) : ev;
    if (this.data.from != 'upc-search') {
      this.getVehicles();
    } else if (this.data.from == 'upc-search') {
      this.getPromoData('');
    }
  }
  close() {
    this.dialogRef.close();
  }
  update() {
    if (this.data.from != 'upc-search') {
      this.search.placeHolder = 'Search UPC / SKU ...';
      this.updateProg = false;
      this.search.value = 'upcs';
      this.disableBtn = true;
      this.loadingMsg = 'Please select Department';
      this.btnText = 'Create Signage';
      this.data.from = 'upc-search';
      this.selectedUpcs = [];
      this.impId = this.gridApi.getSelectedRows()[0].id;
      setTimeout(() => {
        this.search.value = '';
        if (this.fromComp != 'sign-search') {
          this.updateProg = true;
        }
      }, 100);
      this.getPromoData(this.gridApi.getSelectedRows());

      if (this.fromComp == 'blank-ads') {
        this.selectedDepartment = this.data.selectedDepartment;
      }
      return;
    } else {
      this.createSignage();
    }
  }
  createSignage() {
    let params = {
      ad_id: this.appService.adId,
      promotion_ids: this.gridApi
        .getSelectedRows()
        .map(row => row.unique_dept_key),
      flag: this.fromComp == 'sign-search' ? 'signage' : 'promotions',
      signage_ids: this.gridApi.getSelectedRows().map(row => row.id)
    };
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
  getPromoData(data) {
    let deptNames = [];
    this.rowData = [];
    this.rowSelection = 'multiple';
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
      console.log(this.selectedDepartment);
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
      import_ad_id: this.fromComp != 'upc-search' ? this.impId : '',
      flag: this.fromComp != 'sign-search' ? 'promotions' : 'signages',
      page: '',
      perPage: ''
    };
    this.searchparams.dept_group = deptNames;
    this.searchparams.upcs = this.selectedUpcs;
    this.searchparams.import_ad_id =
      this.fromComp != 'upc-search' ? this.impId : '';
    this.searchparams.flag =
      this.fromComp != 'sign-search' ? 'promotions' : 'signages';
    this.getData('searchSignagePromotions');
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
    this.getData('getVehicles');
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
        temp['checkboxSelection'] = true;
        temp['headerCheckboxSelection'] = false;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['pinned'] = 'left';
        temp['cellClass'] =
          this.data.from != 'upc-search' ? 'custom-radio' : 'agCheckBox';
        temp['suppressKeyboardEvent'] = true;
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
    if (this.data.totalSignages.length) {
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
  getData(url) {
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
              if (response['result'].success) {
                this.data = response['result'].data.data;
                dataSource.this.rowData = response['result'].data.data;
                if (response['result'].data.items == 0) {
                } else {
                  // dataSource.this.noUsers = false;
                }
                if (params.startRow === 0) {
                  if (dataSource.this.currentUrl != url) {
                    dataSource.this.columnDefs = dataSource.this.generateColumns(
                      response['result'].data.headers
                    );
                  }
                  dataSource.this.currentUrl = url;
                  dataSource.this.gridApi.setColumnDefs(
                    dataSource.this.columnDefs
                  );
                  if (dataSource.this.rowData.length) {
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
    this.gridApi.setDatasource(dataSource);
  }
}
