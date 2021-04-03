import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
import { ImageAssestsComponent } from '@app/dialogs/image-assests/image-assests.component';
import * as moment from 'moment';
import { NumericEditor } from '@app/shared/component/CellEditors/numeric-editor.component';
import { PriceEditor } from '@app/shared/component/CellEditors/price-editor.component';
import { ImageEditor } from '@app/shared/component/CellEditors/image-editor.component';
import { DateEditorComponent } from '@app/shared/component/CellEditors/date-editor/date-editor.component';
import { CustomTooltipComponent } from '@app/shared/component/custom-tooltip/custom-tooltip.component';
import { OfferUnitCellComponent } from '@app/shared/component/CellEditors/offer-unit-cell/offer-unit-cell.component';

@Component({
  selector: 'app-base-versions',
  templateUrl: './base-versions.component.html',
  styleUrls: ['./base-versions.component.scss'],
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
export class BaseVersionsComponent implements OnInit {
  public subheadersList: any;
  public routeUrl: any;
  public rowData = [];
  public promotionData = [];
  public samplePath: any;
  public cellClassRules: any;
  public currentTabData: any;
  public columnDefs = [];
  public promocolumnDefs = [];
  public versionsForPormos = [];
  public gridApi: any;
  public gridColumnApi;
  public gridApiEve: any;
  public gridColumnApiEve;
  public headersData = [];
  public promoheadersData = [];
  public noData = false;
  public activePage;
  public progress = true;
  public promoProgress = true;
  public calculateCount = false;
  public numbers = [];
  public active = [];
  public baseVersions;
  public minLimit: number;
  public maxLimit: number;
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
  public pageGroup: FormGroup;
  public adName: any;
  private getRowNodeId;
  public adBaseDetails: any;
  public pageVersions = [];
  public baseList: any;
  public previousBasePriceKey: any;
  public currentlySelectedPage: any;
  public imageInfo: any;
  public baseHeaders = [];
  public disableColumns = [];
  public offerUnitSelectOptions = [
    { id: 'E', name: 'E' },
    { id: 'LB', name: 'LB' },
    { id: 'W', name: 'W' }
  ];
  public modOrder = 0;
  public base = {
    key: '',
    value: ''
  };
  public navIdx: any;
  dataLoad = true;
  public oldNode = '';
  public lastUpdatedData = '';
  public listArr = [];
  public currentDefImg = '';
  public newTriggerClr = false;
  public lastEditBfVal = '';
  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    private appService: AppService,
    private adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.getRowNodeId = function(data) {
      return data.id;
    };
  }
  public params = {
    search: '',
    pageSize: 20,
    ad_id: '',
    pageNumber: 1,
    base: ''
  };
  ngOnInit() {
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
    this.adBaseDetails = this.appService.baseVersionDetails;
    if (this.adBaseDetails) {
      this.pageVersions = this.adBaseDetails;
      if (this.pageVersions.length) {
        this.getBaseVersions(
          this.pageVersions.length ? this.pageVersions[0] : ''
        );
      }
    }
    this.currentlySelectedPage = this.pageVersions[0];
    this.calculateCount = true;
    if (!this.pageVersions.length) {
      this.getList();
    }
    this.createForm();
  }

  createForm() {
    this.pageGroup = this.fb.group({
      page_id: ''
    });
    this.setForm();
  }
  setForm() {
    this.pageGroup.patchValue({
      page_id: this.pageVersions.length ? this.pageVersions[0].base_id : ''
    });
  }
  getBaseVersions(obj) {
    if (this.activePage === obj.page_order) {
      return;
    }
    this.rowData = [];
    this.previousBasePriceKey = ''; // setting base price key empty. used in 'getBasePrices()'
    //  if (this.activePage != obj.page_order) {
    this.activePage = obj ? obj.page_order : '';
    if (obj) {
      const params = {
        ad_id: this.appService.adId,
        base_id: obj.base_id
      };
      this.adsService.getBaseVersions(params).then(res => {
        if (res.result.success) {
          const baseResult = res.result.data;
          this.baseList = baseResult;
          this.baseVersions = baseResult.base_version;

          this.getBasePrices(this.baseList.base[0]);
          // this.getBasePrices(this.currentlySelectedPage);
          // this.getPage(this.currentlySelectedPage['base_id']);
        }
      });
    }
    // }
  }
  getBasePrices(obj) {
    //  if (this.previousBasePriceKey != obj.key) {
    this.previousBasePriceKey = obj.key;
    // if (this.gridApi) {
    //   setTimeout(() => {
    //     this.gridApi.forEachNode(node => {
    //       if (node.rowIndex === 0) {
    //         node.setSelected(true);
    //         node.setExpanded(true);
    //       }
    //       return;
    //     });
    //   }, 100);
    // }
    this.versionsForPormos = this.baseVersions[obj.key];
    this.base.key = obj.key;
    this.base.value = obj.value;
    const params = {
      base_value: obj.key,
      base_id: this.baseList.base_id
    };
    this.adsService.getBasePrices(params).then(res => {
      if (res.result.success) {
        this.dataLoad = true;
        this.baseHeaders = res.result.data.headers;
        this.columnDefs = this.generateColumns(
          res.result.data.headers,
          'bases'
        );
        this.rowData = res.result.data.data;
        this.promoProgress = true;
        // this.loadPromtions(this.rowData[0]);

        this.samplePath = res.result.data.samplePath
          ? res.result.data.samplePath
          : '';
        setTimeout(() => {
          if (this.gridColumnApi) {
            this.autoSizeColumns();
          }
        });
        // this.listData = list;
        this.totalCount = res.result.data.count;
        this.disableColumns = res.result.data.disableColumns;
        const index = this.disableColumns.indexOf('image_upcs');
        if (index > -1) {
          this.disableColumns.splice(index, 1);
        }
        // this.calculatePagesCount();
        this.headersData = res.result.data.headers;
        this.frameworkComponents = {
          numericEditor: NumericEditor,
          priceEditor: PriceEditor,
          imageEditor: ImageEditor,
          // dateEditor: DateEditorComponent,
          customTooltipComponent: CustomTooltipComponent,
          offerUnitCellRenderer: OfferUnitCellComponent
        };
        if (this.rowData ? this.rowData.length : false) {
          this.noData = false;
          this.dataLoad = false;
        } else {
          this.noData = true;
          this.dataLoad = false;
        }
        // this.defaultColDef = { editable: true };
        this.rowSelection = 'multiple';
        this.rowGroupPanelShow = 'false';
        setTimeout(() => {
          if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
          }
        });
      }
    });
    //  }
  }
  getPage(id) {
    this.pageVersions.forEach((page, index) => {
      if (id === page.base_id) {
        this.currentlySelectedPage = page;
        // this.getBaseVersions(page);
      }
    });
    this.expandedFirstGroup();
  }

  offerUnitChanged(event) {
    // const focusedCell = this.gridApi.getFocusedCell();
    // const rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
    // rowNode.setDataValue(focusedCell.column.colDef.field, event);
  }

  getList() {
    // this.subheadersList = JSON.parse(APP.systemSettings)[2].value;
    // this.selectedList(this.subheadersList[5]);
    // let i = _.findIndex(JSON.parse(APP.systemSettings), { key: 'Others' });
    // this.subheadersList = i > -1 ? JSON.parse(APP.systemSettings)[i].value : '';

    // this.navIdx = _.findIndex(this.subheadersList, { key: 'BASE_VERSIONS' });
    // this.navIdx > -1 ? this.selectedList(this.subheadersList[this.navIdx]) : '';
    // this.router.navigateByUrl(
    //   'vehicles/' +
    //     this.appService.adId +
    //     '/' +
    //     this.subheadersList[this.navIdx].url
    // );
    // this.selectedList(this.subheadersList[4]);
    this.currentTabData = this.appService.getListData(
      'Others',
      'BASE_VERSIONS'
    );
    this.selectedList(this.currentTabData);
    // this.router.navigateByUrl(
    //   'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    // );
    this.adName = this.appService.adName;
  }

  selectedList(list) {
    this.params.ad_id = this.appService.adId;
    this.listData = list;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        this.dataLoad = true;
        this.rowData = res.result.data.data;
        if (!this.pageVersions.length) {
          if (this.rowData ? this.rowData.length : false) {
            this.noData = false;
            this.dataLoad = false;
          } else {
            this.noData = true;
            this.dataLoad = false;
          }
        }
        this.samplePath = res.result.data.samplePath
          ? res.result.data.samplePath
          : '';
        this.totalCount = res.result.data.count;
        this.calculatePagesCount();
        this.headersData = res.result.data.headers;
        this.columnDefs = this.generateColumns(this.headersData, 'bases');
        this.defaultColDef = { editable: true };
        this.rowSelection = 'multiple';
        this.rowGroupPanelShow = 'always';
        // this.autoGroupColumnDef = {
        //   headerName: 'Athlete',
        //   field: 'athlete',
        //   width: 200,
        //   cellRenderer: 'agGroupCellRenderer',
        //   cellRendererParams: {
        //     checkbox: function(params) {
        //       return params.node.group === true;
        //     }
        //   }
        // };
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
    // setTimeout(() => {
    //   this.gridApi.sizeColumnsToFit();
    // }, 500);
    this.expandedFirstGroup();
    this.autoSizeColumns();

    window.onresize = () => {
      // this.gridApi.sizeColumnsToFit();
    };
  }
  expandedFirstGroup() {
    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.forEachNode(node => {
          if (node.rowIndex === 0) {
            node.setExpanded(true);
            // node.setSelected(true);
          }
          // if (node.childIndex === 1) {
          //   node.setSelected(true);
          // }
        });
      }, 1000);
    }
  }
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

  onGridReadyEve(params) {
    this.gridApiEve = params.api;
    this.gridColumnApiEve = params.columnApi;
    const allColumnIds = [];
    // setTimeout(() => {
    //   this.gridColumnApiEve.getAllColumns().forEach(function(column) {
    //     if (column.colId !== 'ad_details') {
    //       allColumnIds.push(column.colId);
    //     }
    //   });
    //   this.gridColumnApiEve.autoSizeColumns(allColumnIds);
    // }, 200);
    //  this.autoSizeColumnsForPromotions();
  }

  autoSizeColumns() {
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function(column) {
      if (column.colId !== 'ad_details') {
        allColumnIds.push(column.colId);
      }
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  autoSizeColumnsForPromotions() {
    const allColumnIds = [];
    //  setTimeout(() => {
    this.gridColumnApiEve.getAllColumns().forEach(function(column) {
      if (column.colId !== 'ad_details') {
        allColumnIds.push(column.colId);
      }
    });
    this.gridColumnApiEve.autoSizeColumns(allColumnIds);
    // }, 700);
  }

  generateColumns(data: any[], type) {
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
      } else if (data[i].key === 'icon_path') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.data.icon_path +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          if (params.data) {
            let dummyJson = {
              id: params.data.id,
              col: 'icon'
            };
            return JSON.stringify(dummyJson);
          }
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
            return this.rowData[idx1].icon_path;
          } else {
            return params.value;
          }
        };
      } else {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
      }
      const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = navIdx > -1 ? false : true;
      if (data[i].key === 'mod_order') {
        temp['rowGroup'] = 'true';
        temp['hide'] = true;
        // temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['cellRenderer'] = params => {
          return params.value
            ? ` Mod
            ` +
                params.value +
                ``
            : '';
        };
        //   onCellClicked: function(params) {
        //     this.selectedStores(params.data);
        //   }.bind(this),
      }
      if (data[i].key === 'promo_ids') {
        temp['editable'] = false;
      }
      if (data[i].key === 'versions') {
        temp['headerCheckboxSelection'] = false;
        temp['editable'] = false;
        temp['cellClass'] = params => {
          if (params.data) {
            return 'versioning-class';
          }
        };
        temp['checkboxSelection'] = params => {
          if (params.data) {
            return true;
          }
        };
      }
      if (data[i].type === 'image') {
        temp['tooltipComponent'] = 'customTooltipComponent';
        temp['suppressKeyboardEvent'] = this.suppressEnter;
      }
      if (type === 'promos') {
        temp['editable'] = false;
      }
      if (data[i].type === 'number') {
        temp['cellEditor'] = 'numericEditor';
      } else if (data[i].type === 'price') {
        temp['cellEditor'] = 'priceEditor';
      } else if (data[i].type === 'date') {
        // temp['cellEditor'] = 'dateEditor';
        temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
          if (params.value) {
            return moment(params.value).format('MM-DD-YYYY');
          }
        };
      } else if (data[i].type === 'image') {
        temp['cellEditor'] = 'imageEditor';
      }
      if (temp['editable'] && type != 'promos' && !temp['cellClass']) {
        temp['cellClass'] = 'editable_cells';
      }
      if (data[i].key === 'unit' && type !== 'promos') {
        temp['editable'] = false;
        temp['cellClass'] = 'editable_cells';
        temp['cellRenderer'] = 'offerUnitCellRenderer';
      }
      let baseIdx = this.baseHeaders.indexOf(temp['field']);
      temp['cellStyle'] = params => {
        if (this.newTriggerClr && params.value != this.lastEditBfVal) {
          if (data[i].key === 'unit') {
            temp['cellClass'] = ' editable_cells edit_done';
          }
          return { backgroundColor: '#fff1c1' };
        }
      };
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  generateColumns01(data: any[], type) {
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
      } else if (data[i].key === 'icon_path') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.data.icon_path +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          if (params.data) {
            let dummyJson = {
              id: params.data.id,
              col: 'icon'
            };
            return JSON.stringify(dummyJson);
          }
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
            return this.rowData[idx1].icon_path;
          } else {
            return params.value;
          }
        };
      } else {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
      }
      const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = navIdx > -1 ? false : true;
      if (data[i].key === 'mod_order') {
        temp['rowGroup'] = 'true';
        temp['hide'] = true;
        // temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['cellRenderer'] = params => {
          return params.value
            ? ` Mod
            ` +
                params.value +
                ``
            : '';
        };
        //   onCellClicked: function(params) {
        //     this.selectedStores(params.data);
        //   }.bind(this),
      }
      if (data[i].key === 'promo_ids') {
        temp['editable'] = false;
      }
      if (data[i].key === 'versions') {
        temp['headerCheckboxSelection'] = false;
        temp['editable'] = false;
        temp['cellClass'] = params => {
          if (params.data) {
            return 'versioning-class';
          }
        };
        temp['checkboxSelection'] = params => {
          if (params.data) {
            return true;
          }
        };
      }
      if (data[i].type === 'image') {
        temp['tooltipComponent'] = 'customTooltipComponent';
        temp['suppressKeyboardEvent'] = this.suppressEnter;
      }
      if (type === 'promos') {
        temp['editable'] = false;
      }
      if (data[i].type === 'number') {
        temp['cellEditor'] = 'numericEditor';
      } else if (data[i].type === 'price') {
        temp['cellEditor'] = 'priceEditor';
      } else if (data[i].type === 'date') {
        // temp['cellEditor'] = 'dateEditor';
        temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
          if (params.value) {
            return moment(params.value).format('MM-DD-YYYY');
          }
        };
      } else if (data[i].type === 'image') {
        temp['cellEditor'] = 'imageEditor';
      }
      if (temp['editable'] && type != 'promos' && !temp['cellClass']) {
        temp['cellClass'] = 'editable_cells';
      }
      if (data[i].key === 'unit' && type !== 'promos') {
        temp['editable'] = false;
        temp['cellClass'] = 'editable_cells';
        temp['cellRenderer'] = 'offerUnitCellRenderer';
      }
      let baseIdx = this.baseHeaders.indexOf(temp['field']);
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
  onRowGroupOpened(event) {
    const checkedChild = false;
    // this.gridApi.collapseAll();
    this.gridApi.forEachNode(node => {
      if (node.firstChild && node.rowIndex === event.rowIndex + 1) {
        node.setSelected(true);
      }
    });
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
    if (params.colDef.field != 'icon_path') {
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
    if (params.colDef.field === 'icon_path') {
      let itemsObj = {
        key: 'icons',
        item_id: params.data.id
      };
      try {
        var parsed = JSON.parse(params.data.icon_path);
      } catch (e) {
        return;
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx < 0) {
        if (this.currentDefImg === params.data.icon_path) {
          return;
        }
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Icon Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      itemsObj = Object.assign({}, itemsObj, {
        value: this.rowData[idx].icons
      });
      const imgParams = {
        ad_id: this.appService.adId,
        items: []
      };
      imgParams.items.push(itemsObj);
      this.adsService
        .updateFeatureItems([{ url: 'updateBaseItems' }, imgParams])
        .then(res => {
          if (res.result.success) {
            // tslint:disable-next-line:no-shadowed-variable

            rowNode.setDataValue(
              focusedCell.column.userProvidedColDef.field,
              res.result.data[focusedCell.column.userProvidedColDef.field]
            );
            rowNode['data']['icons'] = res.result.data.icons;
          }
          this.gridApi.refreshCells({
            force: true,
            rowNodes: [rowNode],
            columns: [focusedCell.column.userProvidedColDef.field]
          });
        });
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
      .updateFeatureItems([{ url: 'updateBaseItems' }, updateParams])
      .then(res => {});
  }
  onRowSelected(event) {
    var rowCount = event.api.getSelectedNodes().length;
    if (rowCount) {
      if (event.node.selected) {
        if (this.oldNode === event.data.id) {
          return;
        }
        this.promoProgress = true;
        this.oldNode = event.data.id;
        this.loadPromtions(event.data);
      }
    } else {
      this.oldNode = event.data.id;
      event.node.setSelected(true);
    }
  }

  onCellMouseOver(params) {
    // console.log(params);
  }

  onCellClicked(params) {
    if (params.node.group) {
      this.expandCurrentGroup(params.rowIndex);
    }
    if (
      (params.colDef.field === 'image' && params.data.image_upcs !== '') ||
      params.colDef.field === 'logos' ||
      params.colDef.field === 'icon_path'
    ) {
      // tslint:disable-next-line:prefer-const
      var focusedCell = params.api.getFocusedCell();
      // tslint:disable-next-line:prefer-const
      let rowNode = params.api.getDisplayedRowAtIndex(focusedCell.rowIndex);
      //
      // this.imageInfo = (params.colDef.field === 'image') ? 'image_details' : 'logo_details';
      // const index = _.findIndex(this.rowData, { id: params.data.id });
      this.dialogRef = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['campaign-dialog', 'overlay-dialog'],
        width: params.colDef.field === 'image' ? '760px' : '680px',
        data: {
          title: params.data.image_upcs,
          rowData: params.data,
          url: 'updateBaseItems',
          from: params.colDef.field
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        // this.dataLoad = true;
        // this.calculateCount = true;
        if (res ? res.data && res.data.result.success : false) {
          // this.selectedList(this.subheadersList[this.navIdx]);
          //  this.getBaseVersions(this.currentlySelectedPage);
          // this.getPage(this.currentlySelectedPage['base_id']);
          // this.getBaseVersions(this.pageVersions[0]);
          //  this.getBasePrices(this.base);
          // const rowNode = params.api.getRowNode(params.data.id);
          this.currentDefImg =
            res.data.result.data[focusedCell.column.userProvidedColDef.field];
          rowNode.setDataValue(
            focusedCell.column.userProvidedColDef.field,
            res.data.result.data[focusedCell.column.userProvidedColDef.field]
          );
          rowNode['data']['icons'] = res.data.result.data.icons;
        } else {
          const icon_details = Object.values(res);
          const index = _.findIndex(this.rowData, { id: params.data.id });
          const focusedCell = this.gridApi.getFocusedCell();
          const rowNode = this.gridApi.getDisplayedRowAtIndex(
            focusedCell.rowIndex
          );

          this.rowData[index]['icons'] = icon_details;
          rowNode.setDataValue('icons', icon_details);
        }
        this.gridApi.refreshCells({
          force: true,
          rowNodes: [rowNode],
          columns: [focusedCell.column.userProvidedColDef.field]
        });
      });
    }
  }
  loadPromtions(data) {
    if (data) {
      this.modOrder = data.mod_order;
      const params = {
        ad_id: this.appService.adId,
        pageNumber: this.activePage,
        modNumber: data.mod_order,
        versions: data.versions.split(','),
        filter: true,
        promo_id: data.promo_ids.split(',')
      };
      const i = _.findIndex(JSON.parse(APP.systemSettings), { key: 'Others' });
      this.subheadersList =
        i > -1 ? JSON.parse(APP.systemSettings)[i].value : '';

      this.navIdx = _.findIndex(this.subheadersList, { key: 'PROMOTIONS' });
      // this.navIdx > -1 ? this.selectedList(this.subheadersList[this.navIdx]) : '';

      this.adsService
        .getAdModules([
          { url: this.subheadersList[this.navIdx].get_api },
          params
        ])
        .then(res => {
          this.dataLoad = false;
          this.promotionData = res.result.data.data;
          this.promocolumnDefs = this.generateColumns01(
            res.result.data.headers,
            'promos'
          );
          this.promoProgress = false;
          if (this.rowData.length) {
            this.noData = false;
          } else {
            this.noData = true;
          }
          this.samplePath = res.result.data.samplePath
            ? res.result.data.samplePath
            : '';
          this.totalCount = res.result.data.count;
          this.calculatePagesCount();
          setTimeout(() => {
            if (this.gridColumnApi) {
              this.autoSizeColumns();
            }
            if (this.gridColumnApiEve) {
              this.autoSizeColumnsForPromotions();
            }
          }, 50);
          this.promoheadersData = res.result.data.headers;
          // this.disableColumns = res.result.data.disableColumns;
          // this.headersCount = this.headersData ? this.headersData.length : '';

          // this.defaultColDef = { editable: true };
          // this.rowSelection = 'multiple';
          // this.rowGroupPanelShow = 'always';
          // this.autoGroupColumnDef = {
          //   headerName: 'Athlete',
          //   field: 'athlete',
          //   width: 200,
          //   cellRenderer: 'agGroupCellRenderer',
          //   cellRendererParams: {
          //     checkbox: function(params) {
          //       return params.node.group === true;
          //     }
          //   }
          // };
        });
    }
  }
}
