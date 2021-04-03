import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
import { ImageAssestsComponent } from '@app/dialogs/image-assests/image-assests.component';
import { SaveViewComponent } from '@app/dialogs/save-view/save-view.component';
import { NumericEditor } from '@app/shared/component/CellEditors/numeric-editor.component';
import { DateEditorComponent } from '@app/shared/component/CellEditors/date-editor/date-editor.component';
import { PriceEditor } from '@app/shared/component/CellEditors/price-editor.component';
import { ImageEditor } from '@app/shared/component/CellEditors/image-editor.component';
import * as moment from 'moment';
import { CustomTooltipComponent } from '@app/shared/component/custom-tooltip/custom-tooltip.component';
// import { PARAMETERS } from '@angular/core/src/util/decorators';
import { PromtionsViewComponent } from '@app/dialogs/promtions-view/promtions-view.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { OfferUnitCellComponent } from '@app/shared/component/CellEditors/offer-unit-cell/offer-unit-cell.component';
import { CreateSignageComponent } from '@app/dialogs/create-signage/create-signage.component';

@Component({
  selector: 'app-ad-promotions',
  templateUrl: './ad-promotions.component.html',
  styleUrls: ['./ad-promotions.component.scss'],
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
export class AdPromotionsComponent implements OnInit {
  public subheadersList: any;
  public image_url = APP.img_url;
  public routeUrl: any;
  public rowData = [];
  public samplePath: any;
  public columnDefs = [];
  private getRowNodeId;
  public gridApi: any;
  public rowClassRules: any;
  public currentTabData: any;
  public gridColumnApi;
  public headersData = [];
  public noData: any;
  public progress = true;
  public calculateCount = false;
  public fromViewChange = false;
  public numbers = [];
  public active = [];
  public allAutoSizeColumns = [];
  public minLimit: number;
  public maxLimit: number;
  public visibleColumnsCount: number;
  public displayRange: number;
  public pageCount: number;
  public totalCount: number;
  public editProgress: any;
  public dialogRef: any;
  public listData: any;
  private defaultColDef;
  private rowSelection;
  private rowGroupPanelShow;
  private autoGroupColumnDef;
  private frameworkComponents;
  public saveViewGroup: FormGroup;
  public disableColumns: any;
  public navIdx;
  public adName: any;
  public arrangables = [];
  public savedViewOptions = [];
  public savedViewValue: any;
  public imageInfo: any;
  public revisionsHistoryData = [];
  public deleteImage = APP.img_url + 'deleted.png';
  public insertImage = APP.img_url + 'inserted.png';
  public updatedImage = APP.img_url + 'updated.png';
  public boltIcon = APP.img_url + 'bolticon.svg';
  public searchIcon = APP.img_url + 'search-parent.svg';
  public currentDomRevision = -1;
  public domRevisionHistory = [];
  public selectedSignageRows = [];
  public revProgress = true;
  public currentChange = '';
  public lastUpdatedData = '@456||789';
  public revisionParams = {
    ad_id: '',
    id: '',
    pageNumber: 1,
    pageSize: 10
  };
  public canUndoDone = false;
  public canRedoDone = false;
  dataLoad = true;
  revisionDataStatus = true;
  public isDailogOpen = false;
  public gridVisibility = false;
  public currentDefImg = '';
  public pointerEvents = false;
  public newTriggerClr = false;
  public lastEditBfVal = '';
  public totalSignanages = [];
  public deptList = [];
  public selectedDepartment = 'ALL';
  @ViewChild('promoRevisions') public promoRevisionsNav: MatSidenav;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    public adsService: AdsService,
    private activeRoute: ActivatedRoute,
    public fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.getRowNodeId = function(data) {
      return data.unique_dept_key ? data.unique_dept_key : data.id;
    };
  }
  public params = {
    search: '',
    pageSize: 20,
    ad_id: '',
    pageNumber: 1
  };
  ngOnInit() {
    this.adsService.hideHeader = false;
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
        return;
      }
    }
    this.getList();
    this.calculateCount = true;
  }

  getList() {
    this.currentTabData = this.appService.getListData('Others', 'PROMOTIONS');
    this.selectedList(this.currentTabData);
    this.savedViewValue = 1;
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    );
    this.adName = this.appService.adName;
    this.getDepartmnetsList();
  }

  selectedList(list) {
    this.params.ad_id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        this.rowData = res.result.data.data;
        // console.log(this.rowData)
        this.getSavedViews();
        if (this.rowData.length) {
          this.noData = false;
        } else {
          this.noData = true;
          this.dataLoad = false;
        }

        this.samplePath = res.result.data.samplePath
          ? res.result.data.samplePath
          : '';
        this.listData = list;
        this.totalCount = res.result.data.count;
        this.calculatePagesCount();
        this.headersData = res.result.data.headers;
        this.disableColumns = res.result.data.disableColumns;
        // this.headersCount = this.headersData ? this.headersData.length : '';
        this.columnDefs = this.generateColumns(this.headersData);
        // this.defaultColDef = { editable: true };
        const revisionHistory = {
          headerName: '',
          filter: false,
          pinned: 'right',
          enableFilter: false,
          suppressRowClickSelection: true,
          cellRenderer: function(params) {
            if (params.data) {
              return `<span class="history-view"><em class="pixel-icons icon-revision"></em></span>`;
            }
          },
          onCellClicked: function(params) {
            // console.log(params);
            // params.api.selectIndex(params.node.rowIndex);
            const selectedRow = params.data;
            this.revisionParams.ad_id = selectedRow.ad_id;
            this.revisionParams.id = selectedRow.id;
            this.revisionParams.pageNumber = 1;
            this.revisionsHistoryData = [];
            this.openRevisions();
          }.bind(this),
          // template:

          //   '<span class="history-view"><em class="pixel-icons icon-revisions"></em></span>',
          width: 40
        };
        this.columnDefs.push(revisionHistory);
        // setTimeout(function () {
        this.rowClassRules = {
          'row-updated': function(params) {
            return params.data ? params.data.flag === 'updated' : '';
          },
          'row-inserted': function(params) {
            return params.data ? params.data.flag === 'inserted' : '';
          },
          'row-deleted': function(params) {
            return params.data ? params.data.flag === 'deleted' : '';
          }
        };
        // });
        this.frameworkComponents = {
          numericEditor: NumericEditor,
          priceEditor: PriceEditor,
          imageEditor: ImageEditor,
          dateEditor: DateEditorComponent,
          customTooltipComponent: CustomTooltipComponent,
          offerUnitCellRenderer: OfferUnitCellComponent
        };
        setTimeout(() => {
          if (this.gridColumnApi) {
            this.autoSizeColumns();
          }
        });
        this.rowSelection = 'multiple';
        this.rowGroupPanelShow = 'false';
      });
    this.getSelectedSignages();
  }
  getSelectedSignages() {
    this.adsService
      .sendOuput('getSignage', { ad_id: this.appService.adId })
      .then(res => {
        if (res.result.data.length) {
          this.totalSignanages = res.result.data;
        }
      });
  }

  getSelectedView(params) {
    this.fromViewChange = true;
    const index = _.findIndex(this.savedViewOptions, { _id: params });
    const currentGridInfo =
      index > -1 ? this.savedViewOptions[index].grid_info : [];
    this.setGridOptions(currentGridInfo);
  }

  setGridOptions(gridinfo) {
    // tslint:disable-next-line:prefer-const
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
      // this.gridColumnApi.removeValueColumns(allFields);
      // this.gridColumnApi.addValueColumns(valueColumns);
      // this.gridColumnApi.setColumnsVisible(colKeys, false);
      this.gridApi.setFilterModel(filters);
      // this.gridApi.onFilterChanged();
      this.gridApi.setSortModel(sortColumns);
      // this.gridApi.onSortChanged();
      this.applyStickyFilters();
    }
  }

  getSavedViews() {
    this.adsService
      .getSavedPromotionsViews({ ad_id: this.appService.adId })
      .then(res => {
        this.savedViewOptions = res.result.data;
        this.savedViewOptions.unshift({ name: 'Default', _id: 1 });
        this.getSelectedView(this.savedViewValue);
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
    this.selectedList(this.currentTabData);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    this.applyStickyFilters();
    // this.gridApi.sizeColumnsToFit();
    this.autoSizeColumns();
    // var allColumnIds = [];
    // this.gridColumnApi.getAllColumns().forEach(function(column) {
    //   allColumnIds.push(column.colId);
    // });
    // this.gridColumnApi.autoSizeColumns(allColumnIds);

    // setTimeout(function () {
    //   this.rowClassRules = {
    //     "row-updated": function (params) {
    //       return params.data.flag === 'updated';
    //     },
    //     "row-inserted": function (params) {
    //       return params.data.flag === 'inserted';
    //     },
    //     "row-deleted": function (params) {
    //       return params.data.flag === 'deleted';
    //     },
    //   };
    // });

    window.onresize = () => {
      // this.gridApi.sizeColumnsToFit();
    };
  }

  applyStickyFilters() {
    const filtersObj = {
      ad_id: this.appService.adId,
      key: 'promotions'
    };
    const stickyObj = this.adsService.getStickyFilters(filtersObj);
    this.gridApi.setFilterModel(stickyObj.filters);
    // this.gridApi.setSortModel(stickyObj.sort);
    this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;

    if (this.visibleColumnsCount < 8) {
      this.gridApi.sizeColumnsToFit();
    } else {
      this.autoSizeColumns();
    }
    setTimeout(() => {
      this.dataLoad = false;
      this.gridVisibility = true;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 1800);
    }, 200);
  }

  onColumnRowGroupChanged() {
    // when ever we add new rowgroup or remove added row group this will trigger.
    this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;
  }

  autoSizeColumns() {
    this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
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
      'ad_start_date'
    ];
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
            ` +
                params.data.image +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          let dummyJson = {
            id: params.data.id,
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

            if (params.data) {
              if (params.data.flag != 'deleted') {
                return params.value
                  ? ` <img class="img-responsive offer-img"  src="
                ` +
                      this.searchIcon +
                      `">` +
                      `<span class="upc-names-list">` +
                      params.value +
                      `</span>`
                  : '';
              } else {
                return params.value;
              }
            } else {
              return params.value;
            }
          };
        }
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
      }
      const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = navIdx > -1 ? false : true;
      if (temp['editable'] && !temp['cellClass']) {
        temp['cellClass'] = 'editable_cells';
      }
      // navIdx > -1 ? '' : this.arrangables.push(temp['key']);

      // if (data[i].type !== 'text') {
      //   this.allAutoSizeColumns.push(data[i].key);
      // }
      if (data[i].type === 'image') {
        temp['tooltipComponent'] = 'customTooltipComponent';
        temp['suppressKeyboardEvent'] = this.suppressEnter;
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
        temp['cellClass'] = 'agCheckBox';
        temp['suppressKeyboardEvent'] = true;
      }
      if (data[i].type !== 'text' && data[i].key != 'sku_no') {
        this.allAutoSizeColumns.push(data[i].key);
      }

      // if (data[i].type == 'number' && data[i].key == 'sku_no') {
      //   temp['cellClass'] = 'sku_no_class';
      //   temp['cellRenderer'] = params => {
      //     if (params.data) {
      //       return params.value
      //         ? `<span class="data">` +
      //             params.value +
      //             `</span><span class="icon"><i class="pixel-icons icon-search"></i></span>`
      //         : '';
      //     } else {
      //       return params.value;
      //     }
      //   };
      // }
      temp['cellStyle'] = params => {
        if (this.newTriggerClr && params.value != this.lastEditBfVal) {
          return { backgroundColor: '#fff1c1' };
        }
      };
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  suppressEnter(params) {
    let KEY_ENTER = 13;
    var event = params.event;
    var key = event.which;
    var suppress = key === KEY_ENTER;
    return suppress;
  }
  cellEditingStarted(ev) {
    this.lastEditBfVal = ev.value;
    this.newTriggerClr = true;
  }
  cellEditingStopped(ev) {
    this.newTriggerClr = false;
  }
  onCellValueChanged(params) {
    const index = _.findIndex(this.rowData, { id: params.data.id });
    const focusedCell = this.gridApi.getFocusedCell();
    const rowNode = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
    if (this.lastUpdatedData === params.newValue) {
      return;
    }
    if (params.oldValue === null) {
      params.oldValue = '';
    }
    if (params.newValue === null) {
      params.newValue = '';
    }
    if (typeof params.newValue === 'string') {
      params.newValue = params.newValue
        ? params.newValue.trim()
        : params.newValue;
    }
    if (typeof params.oldValue === 'string') {
      params.oldValue = params.oldValue
        ? params.oldValue.trim()
        : params.oldValue;
    }
    if (params.colDef.cellEditor === 'priceEditor') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Price Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
      params.newValue = parseFloat(params.newValue);
      params.oldValue = parseFloat(params.oldValue);
      if (isNaN(params.newValue)) {
        params.newValue = '';
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
    }
    if (params.colDef.cellEditor === 'numericEditor') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Number Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
      params.newValue = parseInt(params.newValue, 10);
      params.oldValue = parseInt(params.oldValue, 10);
      if (isNaN(params.newValue)) {
        params.newValue = '';
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
    }

    if (params.colDef.field != 'logos' && params.colDef.field != 'image') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (params.oldValue === params.newValue) {
        return;
      } else if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Text Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
    }
    if (params.colDef.field === 'logos') {
      let itemsObj = {
        key: 'logo_details',
        item_id: params.data.id
      };
      try {
        var parsed = JSON.parse(params.data.logos);
      } catch (e) {
        return;
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx < 0) {
        if (this.currentDefImg === params.data.logos) {
          return;
        }
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Logos Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      if (parsed.col != 'logos') {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot be pasted from Images to Logos.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      itemsObj = Object.assign({}, itemsObj, {
        value: this.rowData[idx].logo_details
      });
      const imgParams = {
        ad_id: this.appService.adId,
        items: []
      };
      imgParams.items.push(itemsObj);
      this.adsService
        .updateFeatureItems([{ url: 'updatePromoItems' }, imgParams])
        .then(res => {
          if (res.result.success) {
            // tslint:disable-next-line:no-shadowed-variable
            let res1 = {
              data: res
            };
            this.updateGridVal(params, res1, 'logos');
          }
        });
      return;
    } else if (params.colDef.field === 'image') {
      let itemsObj = {
        key: 'image_details',
        item_id: params.data.id
      };
      try {
        var parsed = JSON.parse(params.data.image);
      } catch (e) {
        return;

        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx < 0) {
        if (this.currentDefImg === params.data.image) {
          return;
        }
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot  paste copied data in Images Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      if (parsed.col != 'image') {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot be pasted from Logos to Images.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      itemsObj = Object.assign({}, itemsObj, {
        value: this.rowData[idx].image_details
      });
      const imgParams = {
        ad_id: this.appService.adId,
        items: []
      };
      imgParams.items.push(itemsObj);
      this.adsService
        .updateFeatureItems([{ url: 'updatePromoItems' }, imgParams])
        .then(res => {
          if (res.result.success) {
            // tslint:disable-next-line:no-shadowed-variable
            let res1 = {
              data: res
            };
            this.updateGridVal(params, res1, 'images');
          }
        });
      return;
    }
    // if(this.lastUpdatedData!= '@456||789'){
    //   return;
    // }
    const temp = {
      key: params.colDef.field,
      value:
        params.newValue !== null && params.newValue !== undefined
          ? params.newValue
          : '',
      item_id: params.data.id,
      header_name: params.colDef.headerName
    };
    const revHis = {
      promo_id: params.data.id,
      column_key: params.colDef.field, // change to key
      old_value: params.oldValue,
      new_value: params.newValue
    };
    const arr = [];
    arr.push(temp);
    const updateParams = {
      items: arr,
      ad_id: this.appService.adId
    };
    if (!this.domRevisionHistory.length) {
      this.canUndoDone = true;
    }

    if (this.currentChange === 'redo') {
      this.currentDomRevision > -1
        ? (this.domRevisionHistory[this.currentDomRevision - 1] = revHis)
        : this.domRevisionHistory.push(revHis);
      this.currentChange = '';
    } else if (this.currentChange === 'undo') {
      this.currentDomRevision > -1
        ? (this.domRevisionHistory[this.currentDomRevision] = revHis)
        : this.domRevisionHistory.push(revHis);
      this.currentChange = '';
    } else {
      this.domRevisionHistory.push(revHis);
      this.currentDomRevision = -1;
      this.canUndoDone = true;
    }
    this.adsService
      .updateFeatureItems([{ url: 'updatePromoItems' }, updateParams])
      .then(res => {});
  }

  onRowSelected(event) {
    console.log(event);
    if (this.totalSignanages.length) {
      let index = _.findIndex(this.totalSignanages, {
        unique_dept_key: event.data.unique_dept_key
      });
      if (index > -1) {
        event.node.setSelected(false);
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
    this.selectedSignageRows = this.gridApi.getSelectedRows();
  }

  createSignage() {
    let params = {
      ad_id: this.appService.adId,
      promotion_ids: this.selectedSignageRows.map(row => row.unique_dept_key)
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
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Signage created Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.router.navigateByUrl(
            '/vehicles/' + this.appService.adId + '/signage'
          );
        } else {
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

  getDepartmnetsList() {
    this.adsService
      .getAdModules([
        { url: 'getDepartments' },
        {
          column: '',
          pageNumber: 1,
          pageSize: 21,
          search: '',
          sort: 'asc'
        }
      ])
      .then(res => {
        if (res.result.success && res.result.data.data.length) {
          this.deptList = res.result.data.data;
          this.deptList.unshift({
            dept_code: 0,
            id: 'ALL',
            last_modified: 'Dec 20, 2019 12:30 PM',
            name: 'ALL',
            status: 1
          });
        }
      });
  }

  getPromotionsByDept(event) {
    let dept_filterKey;
    const index = _.findIndex(this.deptList, { id: event });
    if (index > -1) {
      if (event != 'ALL') {
        dept_filterKey =
          this.deptList[index].dept_code +
          ':' +
          ' ' +
          this.deptList[index].name;
      }
      this.dataLoad = true;
      this.adsService
        .getAdModules([
          { url: 'getPromotionView' },
          {
            ...this.params,
            dept_group_filter: dept_filterKey ? dept_filterKey : undefined
          }
        ])
        .then(res => {
          this.dataLoad = false;
          if (res.result.data.count) {
            this.noData = false;
          } else {
            this.noData = true;
          }
          this.rowData = res.result.data.data;
          this.totalCount = res.result.data.count;
        });
    }
  }

  // getImage(param) {
  //   if (param == 'deleted') {
  //     return this.deleteImage;
  //   } else if (param == 'updated') {
  //     return this.updatedImage;
  //   } else {
  //     return this.insertImage;
  //   }
  // }
  expandCurrentGroup(ndeIdx) {
    if (this.gridApi) {
      this.gridApi.forEachNode(node => {
        if (node.rowIndex === ndeIdx) {
          if (node.expanded) {
            node.setExpanded(false);
          } else {
            node.setExpanded(true);
          }
        }
        // if (node.childIndex === 1) {
        //   node.setSelected(true);
        // }
      });
    }
  }
  onCellClicked(params) {
    console.log(params);
    params.event.stopPropagation();
    if (params.node.group) {
      this.expandCurrentGroup(params.rowIndex);
    }
    if (params.colDef.field === 'image' && params.data.image_upcs === '') {
      return;
    }

    if (params.colDef.field === 'sku_no') {
      return;
      // console.log(params.data.id);
      // let params = {
      //   ad_id: this.appService.adId,
      //   pageNumber: this.params.pageNumber,
      //   pageSize: this.params.pageSize,
      //   flag: "ads_list",
      //   sku: ''

      // }
      // this.adsService
      // .getAdModules([
      //   { url: 'searchPromotionsOnSKU' },
      //   params
      // ])
      // .then(res => {

      // })

      this.dialogRef = this.dialog.open(CreateSignageComponent, {
        panelClass: ['overlay-dialog'],
        width: '850px',
        data: {
          title: 'Add Promotion',
          pageNumber: this.params.pageNumber,
          pageSize: this.params.pageSize,
          flag: 'ads_list',
          skuValues: params.value,
          skuPromoId: params.data.id,
          promoFrom: 'promoSku'
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        if (res && res.success) {
          // this.getList();
          this.params.ad_id = this.appService.adId;
          this.adsService
            .getAdModules([{ url: 'getPromotionView' }, this.params])
            .then(res => {
              this.rowData = res.result.data.data;
              this.totalCount = res.result.data.count;

              //  console.log(this.totalCount)
            });
          // this.currentTabData = this.appService.getListData('Others', 'PROMOTIONS');
          // this.selectedList(this.currentTabData);
        }
      });
    }

    if (params.colDef.field === 'image' || params.colDef.field === 'logos') {
      this.imageInfo =
        params.colDef.field === 'image' ? 'image_details' : 'logo_details';
      const index = _.findIndex(this.rowData, { id: params.data.id });
      const focusedCell = this.gridApi.getFocusedCell();
      const rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
      this.isDailogOpen = true;
      this.dialogRef = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['campaign-dialog', 'overlay-dialog'],
        width: params.colDef.field === 'image' ? '760px' : '680px',
        data: {
          title: params.data.image_upcs,
          rowData: params.data,
          url: 'updatePromoItems',
          from: params.colDef.field,
          assetType: params.colDef.field,
          fromComp: 'adPromotions'
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        this.isDailogOpen = false;
        // this.dataLoad = true;
        // this.calculateCount = true;
        if (res ? res.data && res.data.result.success : false) {
          this.updateGridVal(params, res, 'imgDailog');
        } else {
          const logo_details = Object.values(res);
          const index = _.findIndex(this.rowData, { id: params.data.id });
          const focusedCell = this.gridApi.getFocusedCell();
          const rowNode = this.gridApi.getDisplayedRowAtIndex(
            focusedCell.rowIndex
          );
          this.rowData[index][this.imageInfo] = logo_details;
          rowNode.setDataValue(this.imageInfo, logo_details);
        }
      });
    }

    if (params.colDef.field === 'upc') {
      return;
      // params.colDef.field === 'promo_id' <--> removed this condition
      this.dialogRef = this.dialog.open(PromtionsViewComponent, {
        panelClass: ['promotions-dialog', 'history-promos'],
        width: '600px',
        data: {
          title: params.data.image_upcs,
          rowData: params.data,
          url: 'updatePromoItems',
          from: 'promotion',
          currentTabData: {
            _id: '5c5a7504e9f97b7d17cfe8da',
            key: 'PROMOTIONS',
            value: 'Promotions',
            url: 'promotions',
            get_api: 'getPromotionsHistory',
            iconClass: 'pixel-icons icon-events',
            level: 3,
            sub_level: '',
            order: 6,
            status: 1,
            configure: 'yes',
            assign_form: 'no'
          },
          params: {
            ad_id: this.appService.adId,
            promotion_id: params.data.id
          }
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        if (res) {
          const rowNode = this.gridApi.getRowNode(params.data.id);
          rowNode.setData(res.data.data);
          if (this.gridApi) {
            this.gridApi.refreshCells({
              force: true,
              rowNodes: [rowNode]
              // columns: [focusedCell.column.colDef.field] <--> only selected columns mention here if othrewise total cells gets updated.
            });
          }
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Promotion Data Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
    }
  }
  //updateGridValues
  updateGridVal(params, res, from) {
    const index = _.findIndex(this.rowData, { id: params.data.id });
    const focusedCell = this.gridApi.getFocusedCell();
    const rowNode = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
    if (params.colDef.field === 'image') {
      // tslint:disable-next-line:no-shadowed-variable
      let brandDetails = [];
      let prodDetails = [];
      if (res.data.result.data.image_details.length) {
        res.data.result.data.image_details.forEach(attr => {
          if (attr.brand) {
            brandDetails.push(attr.brand);
          }
          if (attr.product) {
            prodDetails.push(attr.product);
          }
        });
        brandDetails = _.uniq(brandDetails);
        prodDetails = _.uniq(prodDetails);
      }
      const rowNode = this.gridApi.getRowNode(res.data.result.data.item_id);
      const flashColumns = [];
      if (rowNode.data.brand !== brandDetails.join(', ')) {
        flashColumns.push('brand');
      }
      if (rowNode.data.product !== prodDetails.join(', ')) {
        flashColumns.push('product');
      }
      rowNode.setDataValue('brand', brandDetails.join(', '));
      rowNode.setDataValue('product', prodDetails.join(', '));
      this.gridApi.flashCells({
        rowNodes: [rowNode],
        columns: flashColumns
      });
    }
    let imageInfo =
      params.colDef.field === 'image' ? 'image_details' : 'logo_details';
    this.rowData[index][imageInfo] = res.data.result.data[imageInfo];
    this.currentDefImg = res.data.result.data[params.colDef.field];
    if (this.currentDefImg) {
      rowNode.setDataValue(
        params.colDef.field,
        res.data.result.data[params.colDef.field]
      );
    }
    this.gridApi.refreshCells({
      force: true,
      rowNodes: [rowNode],
      columns: [params.colDef.field]
    });
  }
  onCellDoubleClicked(params) {
    if (params.data.flag === 'deleted') {
      this.gridApi.stopEditing();
    }
  }
  onFilterChanged(params) {
    if (!this.fromViewChange) {
      const filtersObj = {
        ad_id: this.appService.adId,
        offers: '',
        promotions: {
          filters: this.gridApi.getFilterModel(),
          sort: this.gridApi.getSortModel()
        },
        key: 'promotions'
      };
      this.adsService.setStickyFilters(filtersObj);

      this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;
    }
    this.fromViewChange = false;
  }

  onSortChanged(params) {
    if (!this.fromViewChange) {
      const filtersObj = {
        ad_id: this.appService.adId,
        offers: '',
        promotions: {
          filters: this.gridApi.getFilterModel(),
          sort: this.gridApi.getSortModel()
        },
        key: 'offers'
      };
      this.adsService.setStickyFilters(filtersObj);
    }
  }

  openSaveView() {
    if (this.adsService.isImportProgess) {
      this.adsService.showImportProg();
      return;
    }
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

    this.dialogRef = this.dialog.open(SaveViewComponent, {
      panelClass: ['save-view-dialog', 'overlay-dialog'],
      data: {
        grid_info: filteredGridValues,
        from: 'promotions'
      }
    });

    this.dialogRef.afterClosed().subscribe(res => {
      if (res && res.data.result.success) {
        this.savedViewValue = res.data.result.data._id;
        this.getSavedViews();
      }
    });
  }
  // To Open revisions history side nav
  openRevisions() {
    this.promoRevisionsNav.open();
    this.revProgress = true;
    this.adsService
      .getAdModules([{ url: 'getPromoRevision' }, this.revisionParams])
      .then(res => {
        if (res.result.success && res.result.data.length) {
          this.revisionsHistoryData = this.revisionsHistoryData.length
            ? this.revisionsHistoryData.concat(res.result.data)
            : res.result.data;
          res.result.data.length < this.revisionParams.pageSize
            ? (this.revisionDataStatus = false)
            : (this.revisionDataStatus = true);
          this.revProgress = false;
        } else if (!this.promoRevisionsNav.opened) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: 'Revisions Not Found'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        } else {
          // this.revisionsHistoryData = [];
          this.revProgress = false;
        }
      });
  }
  // To revert from new value to old
  updateRecord(record) {
    this.gridApi.clearRangeSelection();
    this.promoRevisionsNav.close();
    const rowNode = this.gridApi.getRowNode(record.promo_id);
    rowNode.setDataValue(record.column_key, record.old_value);
    this.gridApi.setFocusedCell(rowNode.rowIndex, record.column_key, null);
    this.gridApi.flashCells({
      rowNodes: [rowNode],
      columns: [record.column_key]
    });
    this.snackbar.openFromComponent(SnackbarComponent, {
      data: {
        status: 'success',
        msg: 'Value Updated'
      },
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
  // on scroll down event inifinite scroll in revisions tab
  onScrollDown() {
    this.revisionParams.pageNumber = this.revisionParams.pageNumber + 1;
    if (this.revisionDataStatus) {
      this.openRevisions();
    }
  }
  // on DOM Redo and Undo in grid
  domRevisions(change) {
    this.currentChange = change;
    if (this.domRevisionHistory.length) {
      if (
        change === 'redo' &&
        this.currentDomRevision < this.domRevisionHistory.length
      ) {
        this.currentChange = change;
        // let idx = this.domRevisionHistory.length - (this.currentDomRevision + 1);
        const params = {
          promo_id: this.domRevisionHistory[this.currentDomRevision].promo_id,
          column_key: this.domRevisionHistory[this.currentDomRevision]
            .column_key, // change to key
          old_value: this.domRevisionHistory[this.currentDomRevision].old_value
          // new_value : params.newValue,
        };
        if (this.currentDomRevision > -1) {
          this.updateRecord(params);
          // let idx = this.domRevisionHistory.length - (this.currentDomRevision + 1);
          // this.domRevisionHistory.splice(idx, 1);
          this.canUndoDone = true;
          if (this.currentDomRevision === this.domRevisionHistory.length - 1) {
            this.canRedoDone = false;
          }
          this.currentDomRevision++;
        }
      } else if (change === 'undo') {
        if (this.currentDomRevision > -1) {
          this.currentDomRevision--;
        } else {
          this.currentDomRevision = this.domRevisionHistory.length - 1;
        }
        const params = {
          promo_id: this.domRevisionHistory[this.currentDomRevision].promo_id,
          column_key: this.domRevisionHistory[this.currentDomRevision]
            .column_key, // change to key
          old_value: this.domRevisionHistory[this.currentDomRevision].old_value
          // new_value : params.newValue,
        };
        this.updateRecord(params);
        // this.domRevisionHistory.splice(this.currentDomRevision, 1);
        if (this.currentDomRevision === 0) {
          this.canUndoDone = false;
        }
        if (this.currentDomRevision > -1) {
          this.canRedoDone = true;
        }
      }
    }
  }
  // Keyboard events
  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    if (!this.isDailogOpen) {
      if (this.adsService.isImportProgess) {
        return;
      }
      if (($event.ctrlKey || $event.metaKey) && $event.keyCode === 90) {
        if (this.canUndoDone) {
          this.domRevisions('undo');
        }
      }
      if (($event.ctrlKey || $event.metaKey) && $event.keyCode === 89) {
        if (this.canRedoDone) {
          this.domRevisions('redo');
        }
      }
    }
  }
}
