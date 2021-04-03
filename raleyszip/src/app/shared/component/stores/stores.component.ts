import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { AddStoresComponent } from '@app/dialogs/add-stores/add-stores.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
const APP: any = window['APP'];

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
  public params = {
    sort: 'asc',
    flag: 'selected',
    ad_id: '',
    search: '',
    column: 'store_id'
  };
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onUpdate = new EventEmitter<any>();
  public dialogRef: any;
  public progress = false;
  public rowData = [];
  public columnDefs = [];
  public gridApi;
  public gridColumnApi;
  public storesCount;
  public marketsCount;
  public versionsCount;
  public noStores = APP.img_url + 'Stores.svg';
  public gridVisibility = false;
  public pointerEvents = false;

  constructor(
    public adsService: AdsService,
    private appService: AppService,
    public dialog: MatDialog,
    public snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getAdStores();
  }
  addStores() {
    this.params.flag = 'all';
    this.getAdStores();
  }
  getAdStores() {
    this.progress = true;
    this.params.ad_id = this.appService.adId;
    this.adsService.getAdStores(this.params).then(res => {
      this.storesCount = res.result.data.count ? res.result.data.count : 0;
      this.marketsCount = res.result.data.marketsCount
        ? res.result.data.marketsCount
        : 0;
      this.versionsCount = res.result.data.versionsCount
        ? res.result.data.versionsCount
        : 0;
      this.rowData = res.result.data.data;
      this.columnDefs = this.generateColumns(res.result.data.headers);
      if (this.gridApi) {
        setTimeout(() => {
          this.gridApi.sizeColumnsToFit();
        }, 100);
        // const allColumnIds = [];
        // this.gridColumnApi.getAllColumns().forEach(function (column) {
        //   allColumnIds.push(column.colId);
        // });
        // this.gridColumnApi.autoSizeColumns(allColumnIds);
      }
      this.progress = false;
    });
  }
  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['tooltipValueGetter'] = params => params.value;
      temp['enableRowGroup'] = false;
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.closeToolPanel();
    // const allColumnIds = [];
    // this.gridColumnApi.getAllColumns().forEach(function(column) {
    //   allColumnIds.push(column.colId);
    // });
    // this.gridColumnApi.autoSizeColumns(allColumnIds);
    this.gridApi.sizeColumnsToFit();
    setTimeout(() => {
      this.gridVisibility = true;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 800);
    }, 200);
  }
  adStores() {
    this.dialogRef = this.dialog.open(AddStoresComponent, {
      panelClass: ['overlay-dialog', 'store-add-edit'],
      width: '900px',
      data: {
        mode: this.rowData.length ? 'Edit' : 'Add'
        // title: 'Campaign',
        // selectedRow: select,
        // headersData: this.headersData,
        // editListForm: this.editListForm,
        // section: this.state.section
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg:
              ' Stores ' +
              (this.storesCount > 0 ? 'Updated' : 'Added') +
              ' Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.appService.adDetails['markets'] = result.data.markets;
        this.onUpdate.emit(result.data.markets);
        this.getAdStores();
      }
    });
  }
}
