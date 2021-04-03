import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { LicenseManager } from 'ag-grid-enterprise';
import { AdsService } from '../ads.service';
LicenseManager.setLicenseKey(
  'Enterpi_Software_Solutions_Private_Limited_MultiApp_1Devs21_August_2019__MTU2NjM0MjAwMDAwMA==f0a6adf3f22452a5a3102029b1a87a43'
);

const APP: any = window['APP'];
import * as _ from 'lodash';
import { CreateAdComponent } from '@app/dialogs/create-ad/create-ad.component';
import * as moment from 'moment';
import { NumericEditor } from '@app/shared/component/CellEditors/numeric-editor.component';
import { DateEditorComponent } from '@app/shared/component/CellEditors/date-editor/date-editor.component';
import { PriceEditor } from '@app/shared/component/CellEditors/price-editor.component';

@Component({
  selector: 'app-ads-list',
  templateUrl: './ads-list.component.html',
  styleUrls: ['./ads-list.component.scss'],
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
export class AdsListComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    protected localStorage: LocalStorage
  ) {
    this.sideBar = {
      toolPanels: [
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel'
        }
      ],
      defaultToolPanel: 'filters',
      hiddenByDefault: true
    };
  }
  public rowData = [];
  public headersData = [];
  public columnDefs = [];
  public gridApi: any;
  public gridColumnApi;
  public tabData: any;
  public vehicleUrl: any;
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
  public gridVisibility = false;
  private rowGroupPanelShow;
  public toggleClass = false;
  public dialogRef: any;
  public url = APP.api_url;
  public search = {
    placeHolder: 'Search Ad',
    value: ''
  };
  private frameworkComponents;
  public createAdForm: FormGroup;
  public params = {
    search: '',
    pageSize: 21,
    pageNumber: 1
  };
  public sideBar;
  public createAddPer;
  ngOnInit() {
    if (!this.appService.configLabels.length) {
      let sysVals = JSON.parse(APP.systemSettings);
      let i = _.findIndex(sysVals, {
        key: 'Top-Headers'
      });
      this.appService.configLabels = i > -1 ? sysVals[i].value : [];
    }
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        //  this.router.navigateByUrl('access-denied');
        window.location.href =
          this.url + '#/' + this.appService.configLabels[0].url;
      } else {
        this.createAddPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['CREATE_ADS']
          : true;
        this.calculateCount = true;
        this.getVehicleData();
        this.createForm();
      }
    }
  }
  createForm(): void {
    this.createAdForm = this.fb.group({
      name: ['', Validators.required],
      marketing_goal: '',
      begin_date: [null, Validators.required],
      end_date: ['', Validators.required],
      status: ''
    });
  }
  getVehicleData() {
    this.tabData = this.appService.getListData('Top-Headers', 'ADS');
    this.getVehicles();
  }

  getVehicles() {
    this.params.search = this.search.value;
    this.adsService
      .getVehicles([{ url: 'getVehicles' }, this.params])
      .then(res => {
        this.rowData = res.result.data.data;
        if (!this.headersData.length) {
          this.columnDefs = this.generateColumns(res.result.data.headers);
        }
        this.headersData = this.headersData.length
          ? this.headersData
          : res.result.data.headers;
        this.rowData = res.result.data.data;
        this.totalCount = res.result.data.count;
        this.toggleClass = false;
        // this.columnDefs = this.generateColumns(this.headersData);
        this.calculatePagesCount();
        if (this.rowData && this.rowData.length) {
          this.noData = false;
          // this.progress = false;
          setTimeout(() => {
            if (this.gridApi) {
              this.gridApi.sizeColumnsToFit();
              //  this.gridApi.setSideBarVisible(true);
            }
          });
        } else {
          this.noData = true;
          this.progress = true;
        }
      });
    this.rowGroupPanelShow = '';
    this.frameworkComponents = {
      numericEditor: NumericEditor,
      priceEditor: PriceEditor,
      dateEditor: DateEditorComponent
    };
  }

  onSearch(event: any): void {
    this.noData = false;
    this.toggleClass = true;
    this.search.value = event;
    this.calculateCount = true;
    this.params.pageNumber = 1;
    this.getVehicles();
  }

  calculatePagesCount() {
    if (this.calculateCount) {
      this.numbers = [];
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
    this.minLimit = this.minLimit < 0 ? 0 : this.minLimit;
    this.active[num] = !this.active[num];
    if (this.params.pageNumber === num) {
      return 0;
    }
    this.toggleClass = true;
    this.params.pageNumber = num;
    setTimeout(() => {
      this.rowData = [];
      this.getVehicles();
    }, 200);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridColumnApi.autoSizeColumns(['week_no', 'start_date', 'status']);
    this.gridApi.closeToolPanel();
    // this.gridApi.sizeColumnsToFit();

    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
    };
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
      this.progress = false;
      this.gridVisibility = true;
    }, 500);
  }

  rowClicked(param) {
    this.router.navigate([
      'vehicles/' + param.data.id,
      { rowData: param.data }
    ]);
    this.appService.adId = param.data.id;
    this.appService.adName = param.data.vehicle;
  }
  createAd() {
    this.dialogRef = this.dialog.open(CreateAdComponent, {
      panelClass: ['ads-dialog', 'overlay-dialog'],
      width: '800px',
      data: {
        form: this.createAdForm
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {});
  }
  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['enableRowGroup'] = true;
      if (data[i].key === 'vehicle') {
        temp['cellRenderer'] = (params: {
          value: string;
          data: { channel_icon: string };
        }) => {
          let chnlIcon = params.data.channel_icon
            ? params.data.channel_icon
            : 'icon-custom-ad';
          return params.value
            ? `<div class="icon-render">
            <em class="pixel-icons ` +
                chnlIcon +
                `"></em>
							<span>` +
                params.value +
                `</span>
						</div>`
            : '';
        };
      }
      if (data[i].key === 'pages_count') {
        temp['cellRenderer'] = (params: { value: string | number }) => {
          if (params.value === 0) {
            return '-';
          }
          const pageCount =
            params.value > 1 || params.value === 0 ? ' Pages' : ' Page';
          return params.value
            ? `<div class="pages"><span>` +
                params.value +
                pageCount +
                `</span></div>`
            : '';
        };
      }
      if (data[i].key === 'status') {
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
      if (data[i].type === 'number') {
        temp['cellEditor'] = 'numericEditor';
      } else if (data[i].type === 'price') {
        temp['cellEditor'] = 'priceEditor';
      } else if (data[i].type === 'date') {
        temp['cellEditor'] = 'dateEditor';
        temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
          return moment(params.value).format('MM-DD-YYYY');
        };
        temp['keyCreator'] = (params: { value: moment.MomentInput }) => {
          return moment(params.value).format('MM-DD-YYYY');
        };
      }
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
}
