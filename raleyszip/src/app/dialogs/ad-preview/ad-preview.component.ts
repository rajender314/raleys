import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { trigger, transition, style, animate } from '@angular/animations';
import 'ag-grid-enterprise';
import { SaveViewComponent } from '../save-view/save-view.component';
import * as _ from 'lodash';
import { AppService } from '@app/app.service';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

@Component({
  selector: 'app-ad-preview',
  templateUrl: './ad-preview.component.html',
  styleUrls: ['./ad-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdPreviewComponent implements OnInit {
  public rowData = [];
  public columnDefs = [];
  public gridApi: any;
  public gridColumnApi: any;
  public rowSelection: string;
  public getRowNodeId;
  public headersData = [];
  public noData: boolean;
  public savedViewOptions = [];
  public savedViewValue: any;
  public visibleColumnsCount: number;
  public totalCount: number;
  public dataLoad = true;
  public gridVisibility = false;
  public pointerEvents = false;
  public fromPage: any;
  public viewReportPer;

  constructor(
    public dialogRef: MatDialogRef<AdPreviewComponent>,
    public dialogRef2: MatDialogRef<SaveViewComponent>,
    public dialog: MatDialog,
    private adsService: AdsService,
    private appService: AppService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.viewReportPer = this.appService.headerPermissions['VIEW_REPORTS'];
    if (this.data) {
      this.fromPage = this.data.from;
      this.savedViewValue = 1;
      this.getAdPreview(this.data.ad_id);
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (this.rowData.length) {
      if (this.fromPage === 'adReports') {
        this.setGridOptions(this.data.gridinfo['grid_info']);
      }
    }
    this.gridApi.closeToolPanel();
    this.rowSelection = 'multiple';
    this.autoSizeColumns();
  }

  autoSizeColumns() {
    var allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function(column) {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  getAdPreview(adId) {
    var adPreviewObj = {
      ad_id: adId
    };
    this.adsService.getAdPreviewById(adPreviewObj).then(res => {
      this.rowData = res.result.data.data;
      this.headersData = res.result.data.headers;
      this.totalCount = res.result.data.data.length;
      this.columnDefs = this.generateColumns(this.headersData);

      if (this.rowData.length) {
        if (this.fromPage === 'adReports') {
          // this.setGridOptions(this.data.gridinfo['grid_info']);
        } else {
          this.getSavedAdViews();
        }
        this.noData = false;
        setTimeout(() => {
          this.dataLoad = false;
          this.gridVisibility = true;
          setTimeout(() => {
            this.pointerEvents = true;
          }, 1800);
        }, 200);
      } else {
        this.noData = true;
        this.dataLoad = false;
      }
    });
  }

  getSavedAdViews() {
    this.adsService
      .getSavedAdViews({ ad_id: this.appService.adId })
      .then(res => {
        this.savedViewOptions = res.result.data;
        this.savedViewOptions.unshift({ name: 'Default', _id: 1 });
        this.getSelectedView(this.savedViewValue);
      });
  }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['tooltipValueGetter'] = params => params.value;
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }

  close() {
    // close ad-preview modal dialog
    this.dialogRef.close();
  }

  openSaveView(from) {
    this.gridApi.closeToolPanel();
    const gridInfo = {
      groupInfo: this.gridColumnApi.getRowGroupColumns(),
      filterInfo: this.gridApi.getFilterModel(),
      valColumnInfo: this.gridColumnApi.getValueColumns(),
      allColumnsInfo: this.gridColumnApi.getAllColumns(),
      pivoteMode: this.gridColumnApi.isPivotMode(),
      allPivoteColumns: this.gridColumnApi.getPivotColumns(),
      sortColumns: this.gridApi.getSortModel()
    };
    const filteredGridValues = this.adsService.getGridInfo(gridInfo);
    this.dialogRef2 = this.dialog.open(SaveViewComponent, {
      panelClass: ['save-view-dialog', 'overlay-dialog'],
      data: {
        grid_info: filteredGridValues,
        from: from
      }
    });
    this.dialogRef2.afterClosed().subscribe(res => {
      if (res && res.data.result.success) {
        if (res.from === 'report') {
          // from save report btn scenario
          // console.log(' from reports sections .....');
        } else {
          // from save view btn scenario
          this.savedViewValue = res.data.result.data._id;
          this.getSavedAdViews();
        }
      }
    });
  }

  openSaveReport(from) {
    this.openSaveView(from);
  }

  getSelectedView(params) {
    //  this.fromViewChange = true;
    this.savedViewValue = params;
    const index = _.findIndex(this.savedViewOptions, { _id: params });
    const currentGridInfo =
      index > -1 ? this.savedViewOptions[index].grid_info : [];
    this.setGridOptions(currentGridInfo);
  }

  setGridOptions(gridinfo) {
    // tslint:disable-next-line:prefer-const
    let x = 0;
    let allFields = [],
      colKeys = [],
      rowGroupFields = [],
      filters = [],
      pivoteMode = false,
      pivoteColumns = [],
      sortColumns = [];
    if (gridinfo) {
      colKeys = gridinfo['inVisibleColumnsInfo'] || [];
      filters = gridinfo['filterInfo'] ? gridinfo['filterInfo'][0] || [] : [];
      rowGroupFields = gridinfo['groupInfo'] || [];
      pivoteMode = gridinfo['pivoteMode'] || false;
      pivoteColumns = gridinfo['pivoteColumns'] || [];
      sortColumns = gridinfo['sortColumns'] || [];
    }
    if (this.fromPage === 'adReports') {
      x = 50;
    }
    // setTimeout(() => {
    if (this.gridColumnApi) {
      const columns = this.gridColumnApi.getAllColumns();
      columns.forEach(column => {
        allFields.push(column['colId']);
        if (!column['visible']) {
          this.gridColumnApi.setColumnVisible(column['colId'], true);
        }
      });

      this.visibleColumnsCount = columns.length - colKeys.length;
      this.gridColumnApi.removeRowGroupColumns(allFields);
      this.gridColumnApi.setColumnsVisible(colKeys, false);
      this.gridColumnApi.setPivotMode(pivoteMode);
      this.gridColumnApi.addRowGroupColumns(rowGroupFields);
      this.gridColumnApi.removePivotColumns(allFields);
      this.gridColumnApi.setPivotColumns(pivoteColumns);
      this.gridApi.setFilterModel(filters);
      this.gridApi.setSortModel(sortColumns);
      this.dataLoad = false;
      this.gridVisibility = true;
    }
    // }, x);
  }

  onFilterChanged(event) {
    this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;
  }

  adExport() {
    var obj = {
      ad_id: this.appService.adId,
      view_id: this.savedViewValue
    };
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: { rowData: { label: 'Ad Preview' }, mode: 'export', exportObj: obj }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res.from === 'close1') {
        // if it is from ad preview...
        if (res && res.result.result.success && res.result.result.data.status) {
          window.location = res.result.result.data.data;
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Exported Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      }
    });
  }
}
