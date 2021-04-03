import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppService } from '@app/app.service';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-stores',
  templateUrl: './add-stores.component.html',
  styleUrls: ['./add-stores.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddStoresComponent implements OnInit {
  public rowData = [];
  public columnDefs = [];
  public params = {
    sort: 'asc',
    flag: 'selected',
    ad_id: '',
    search: '',
    column: 'store_id'
  };
  public gridApi;
  public stores = [];
  public alreadySelectedStores = [];
  public markets = [];
  public rowSelection;
  public adStoresInfo: any;
  public disableUpdateBtn = true;
  public checkingNodes = false;
  public mode;
  public gridColumnApi;
  public progress = false;
  public dataLoad = true;
  public noData: any;
  private selectedTab = 0;
  public gridVisibility = false;
  public pointerEvents = false;
  constructor(
    public dialogRef: MatDialogRef<AddStoresComponent>,
    public appService: AppService,
    public adsService: AdsService,
    public changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.mode = this.data.mode;
    this.getAdStores();
  }
  getAdStores() {
    this.progress = true;
    this.params.ad_id = this.appService.adId;
    this.checkingNodes = true;
    this.adsService.getAdStores(this.params).then(res => {
      this.rowData = res.result.data.data;
      if (this.rowData.length) {
        this.noData = false;
      } else {
        this.noData = true;
        this.dataLoad = false;
      }
      this.adStoresInfo = res.result.data;
      this.columnDefs = this.generateColumns(res.result.data.headers);

      this.rowSelection = "'multiple'";
      if (this.params.flag === 'selected') {
        this.alreadySelectedStores = _.map(this.rowData, 'store_id');
      }
      setTimeout(() => {
        if (this.params.flag === undefined || this.params.flag === 'selected') {
          if (this.gridApi) {
            this.gridApi.forEachNode(node => {
              node.setSelected(true);
              node.setExpanded(true);
            });
            this.checkingNodes = false;
          }
        } else if (this.params.flag === 'all') {
          this.gridApi.forEachNode(node => {
            const index = this.appService.adDetails['stores'].indexOf(
              node.data.store_id
            );
            if (index > -1) {
              node.setSelected(true);
              node.setExpanded(true);
            }
          });
          this.checkingNodes = false;
        } else {
          this.checkingNodes = false;
        }
        if (this.gridColumnApi) this.autoSizeColumns();
        if (this.gridApi) this.gridApi.sizeColumnsToFit();
        // if (!this.changeDetectorRef['destroyed']) {
        //   this.gridApi.sizeColumnsToFit()
        // }
      }, 200);
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
      // temp['enableRowGroup'] = true;
      if (data[i].key === 'store_id') {
        temp['checkboxSelection'] = true;
        temp['headerCheckboxSelection'] = true;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        //   onCellClicked: function(params) {
        //     this.selectedStores(params.data);
        //   }.bind(this),
      }

      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.autoSizeColumns();
    this.gridApi.closeToolPanel();
    this.gridApi.sizeColumnsToFit();
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 800);
    }, 200);
  }
  autoSizeColumns() {
    var autoSizeCols = ['store_location'];
    this.gridColumnApi.autoSizeColumns(autoSizeCols);
  }

  close = () => {
    this.dialogRef.close();
  };

  test(a) {
    this.selectedTab = a.index;
    this.disableUpdateBtn = true;
    if (a.index === 0) {
      this.params.flag = 'selected';
    }
    if (a.index === 1) {
      this.params.flag = 'unselected';
    }
    if (a.index === 2) {
      this.params.flag = 'all';
    }
    this.getAdStores();
  }
  selectedStores(data) {}

  onRowSelected(event) {
    if (this.params.flag === 'unselected') {
      if (this.gridApi.getSelectedRows().length <= 0) {
        this.disableUpdateBtn = true;
      } else {
        this.disableUpdateBtn = false;
      }
    } else if (this.params.flag === 'selected') {
      const storeslist = this.appService.adDetails['stores'];
      const selectedStoresList = _.map(
        this.gridApi.getSelectedRows(),
        'store_id'
      );
      if (
        storeslist.length === selectedStoresList.length ||
        selectedStoresList.length === 0
      ) {
        this.disableUpdateBtn = true;
      } else {
        this.disableUpdateBtn = false;
      }
    } else {
      const storeslist = this.appService.adDetails['stores'];
      const selectedStoresList = _.map(
        this.gridApi.getSelectedRows(),
        'store_id'
      );
      if (
        (storeslist &&
          (storeslist.length === selectedStoresList.length &&
            storeslist.sort().every(function(value, index) {
              return value === selectedStoresList.sort()[index];
            }))) ||
        selectedStoresList.length <= 0
      ) {
        this.disableUpdateBtn = true;
      } else {
        this.disableUpdateBtn = false;
      }
    }
  }

  onSelectionChanged(event) {
    // var rowCount = event.api.getSelectedNodes().length;
  }

  update() {
    const stores = this.gridApi.getSelectedRows();
    let storesArray = _.map(stores, 'store_id');
    let paramsObj = {};
    if (this.params.flag === 'selected' || this.params.flag === 'all') {
      this.appService.adDetails['stores'] = storesArray;
      paramsObj = {
        stores: storesArray,
        markets: this.markets,
        id: this.appService.adId,
        vehicle: this.appService.adName
      };
    } else {
      storesArray = storesArray.concat(this.alreadySelectedStores);
      this.appService.adDetails['stores'] = storesArray;
      paramsObj = {
        stores: storesArray,
        markets: this.markets,
        id: this.appService.adId,
        vehicle: this.appService.adName
      };
    }
    this.adsService.createAds(paramsObj).then(res => {
      if (res.result.success) {
        this.dialogRef.close({ data: res.result.data });
      }
    });
  }

  changeTab() {
    this.selectedTab = 2;
  }
}
