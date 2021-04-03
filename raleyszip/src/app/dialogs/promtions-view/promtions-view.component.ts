import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { AppService } from '@app/app.service';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
@Component({
  selector: 'app-promtions-view',
  templateUrl: './promtions-view.component.html',
  styleUrls: ['./promtions-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PromtionsViewComponent implements OnInit {
  public subheadersList: any;
  public routeUrl: any;
  public rowData = [];
  public samplePath: any;
  public columnDefs = [];
  public gridApi: any;
  public gridColumnApi;
  public headersData = [];
  public noData: any;
  public progress = true;
  public calculateCount = false;
  public numbers = [];
  public active = [];
  public minLimit: number;
  public maxLimit: number;
  public displayRange: number;
  public pageCount: number;
  public totalCount: number;
  public editProgress: any;
  public listData: any;
  private defaultColDef;
  private rowSelection;
  private rowGroupPanelShow;
  private autoGroupColumnDef;
  public disableColumns = [];
  public navIdx;
  public adName: any;
  public arrangables = [];
  public errorMsg = '';
  public historyPromoId = '';
  dataLoad = true;
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<PromtionsViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  public params = {
    search: '',
    pageSize: 20,
    ad_id: '',
    pageNumber: 1
  };
  ngOnInit() {
    this.getList();
    this.calculateCount = true;
  }

  getList() {
    let currentTabData = this.appService.getListData('Others', 'PROMOTIONS');
    if (this.data.from === 'promotion') {
      currentTabData = this.data.currentTabData;
    }
    this.selectedList(currentTabData);
    this.adName = this.appService.adName;
  }

  selectedList(list) {
    this.params.ad_id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.data.params])
      .then(res => {
        this.dataLoad = false;
        this.rowData = res.result.data.data;
        if (this.rowData.length) {
          this.noData = false;
        } else {
          this.noData = true;
        }

        this.samplePath = res.result.data.samplePath
          ? res.result.data.samplePath
          : '';
        this.listData = list;
        this.totalCount = res.result.data.count;
        this.calculatePagesCount();
        setTimeout(() => {
          if (this.gridColumnApi) {
            this.autoSizeColumns();
          }
        });
        this.headersData = res.result.data.headers;
        this.disableColumns = res.result.data.disableColumns;
        this.columnDefs = this.generateColumns(this.headersData);
        this.rowSelection = 'multiple';
        this.rowGroupPanelShow = 'always';
      });
  }

  calculatePagesCount() {
    if (this.calculateCount) {
      this.pageCount = this.totalCount / this.params.pageSize;
      this.pageCount = Math.ceil(this.pageCount);
      this.editProgress = false;
      for (let i = 1; i <= this.pageCount; i++) {
        this.numbers.push(i);
        this.active[i] = false;
      }
      this.active[1] = true;
      this.minLimit = 0;
      this.displayRange = 5;
      this.maxLimit = this.minLimit + this.displayRange;
    }
    this.calculateCount = false;
  }

  loadMore(param) {
    this.dataLoad = true;
    let num = param;
    let indx;
    for (let i = 1; i <= this.numbers.length; i++) {
      if (this.active[i] === true) {
        indx = i;
      }
    }
    if (param === 'prev') {
      num = indx - 1;
    }
    if (param === 'next') {
      num = indx + 1;
    }
    for (let i = 1; i <= this.numbers.length; i++) {
      this.active[i] = false;
    }
    if (num === 1) {
      this.minLimit = num - 1;
    } else if (num === this.numbers.length) {
      this.minLimit = num - this.displayRange;
    } else {
      this.minLimit = num - 2;
    }
    this.maxLimit = this.minLimit + this.displayRange;
    if (this.maxLimit > this.numbers.length) {
      this.minLimit = this.numbers.length - this.displayRange;
    }
    this.active[num] = !this.active[num];
    this.params.pageNumber = num;
    this.selectedList(this.subheadersList[this.navIdx]);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    // this.autoSizeColumns();
    window.onresize = () => {
      // this.gridApi.sizeColumnsToFit();
    };
    this.gridApi.forEachNode(node => {
      if (node.rowIndex === 0) {
        node.setSelected(true);
      }
    });
  }
  autoSizeColumns() {
    // const allColumnIds = [];
    // this.gridColumnApi.getAllColumns().forEach(function(column) {
    //   if (this.arrangables.length) {
    //     const navIdx = this.arrangables.indexOf(column.colId);
    //     if (navIdx > -1) {
    //       allColumnIds.push(column.colId);
    //     }
    //   }
    // });
    // this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['tooltipValueGetter'] = params => params.value;
      if (data[i].key === 'image' || data[i].key === 'logos') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        temp['cellRenderer'] = params => {
          return params.value
            ? ` <img class="img-responsive offer-img" src="
            ` +
                params.value +
                `">`
            : '';
        };
      }
      if (data[i].key === 'vehicle') {
        temp['headerCheckboxSelection'] = false;
        temp['editable'] = false;
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'vehicle-class';
        temp['checkboxSelection'] = params => {
          if (params.data) {
            return true;
          }
        };
      } else {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
      }
      // const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = false;
      // if (navIdx < 0) {
      //   this.arrangables.push(temp['key']);
      // }
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onCellValueChanged(params) {
    if (params.oldValue === params.newValue) {
      return;
    }
    const temp = {
      key: params.colDef.field,
      value: params.newValue,
      item_id: params.data.id
    };
    const arr = [];
    arr.push(temp);
    const updateParams = {
      items: arr,
      ad_id: this.appService.adId
    };

    this.adsService
      .updateFeatureItems([{ url: 'updatePromoItems' }, updateParams])
      .then(res => {});
  }
  update() {
    let param = {
      promotion_id: this.data.rowData.id,
      history_promotion_id: this.historyPromoId
    };
    this.adsService
      .updateFeatureItems([{ url: 'updatePromotionData' }, param])
      .then(res => {
        if (res.result.success) {
          this.dialogRef.close({ data: res.result.data });
        } else {
          this.errorMsg = res.result.message
            ? res.result.message
            : 'Server Error';
        }
      });
  }
  closeDialog() {
    this.dialogRef.close();
  }
  onCellClicked(params) {
    // console.log(params);
    if (
      (params.colDef.field === 'image' || params.colDef.field === 'logos') &&
      params.data.image_upcs !== ''
    ) {
      this.dialogRef.afterClosed().subscribe(res => {
        // this.dataLoad = true;
        // this.calculateCount = true;
        if (res ? res.data.result.success : false) {
          this.selectedList(this.subheadersList[this.navIdx]);
        }
      });
    }
  }
  onRowSelected(event) {
    var rowCount = event.api.getSelectedNodes().length;
    if (rowCount) {
      if (event.node.selected) {
        this.historyPromoId = event.data.id;
      }
    } else {
      event.node.setSelected(true);
    }
  }
}
