import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import { MatDialog, MatSidenav, MatSnackBar } from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
import { EditCampaignComponent } from '@app/dialogs/edit-campaign/edit-campaign.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
// import { Pagination } from '@app/shared/utility/types';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AppService } from '@app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidation } from '@app/shared/utility/custom-validations';
const APP: any = window['APP'];

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({
          transform: 'translateX(100px)',
          opacity: 0
        }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class CampaignListComponent implements OnInit {
  public editListForm: FormGroup;
  public filterValues: FormGroup;
  public editMode = false;
  public tabData: any;
  public toggleClass: boolean = false;
  public search = {
    placeHolder: 'Search Campaign',
    value: ''
  };
  public gridApi;
  public gridColumnApi;
  public rowData = [];
  public columnDefs = [];
  public selectedRow = [];
  public editProgress;
  public dialogRef: any;
  public autoGroupColumnDef: any;
  public params = {
    search: '',
    pageSize: 21,
    pageNumber: 1,
    start_date: '',
    end_date: ''
  };
  public sideBar = {
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
  public paginationData = {
    totalCount: '',
    pageSize: ''
  };
  dataLoad = true;
  noData = false;
  calculateCount = false;
  // side nav component
  numbers = [];
  active = [];
  minLimit: number;
  maxLimit: number;
  displayRange: number;
  pageCount: number;
  totalCount: number;
  public gridVisibility = false;
  public headersData = [];
  public state = {
    section: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Campaign Name',
        value: '',
        rowDrag: true
      },
      {
        name: 'marketing_goal',
        type: 'text',
        required: '',
        label: 'Marketing Goal',
        value: ''
      },
      {
        name: 'start_date',
        type: 'date',
        required: true,
        label: 'Start Date',
        value: ''
      },
      {
        name: 'end_date',
        type: 'date',
        required: true,
        label: 'End Date',
        value: ''
      },
      {
        name: 'status',
        type: 'button',
        required: true,
        label: 'Status',
        value: ''
      }
    ],
    filterHeads: [
      {
        name: 'start_date',
        type: 'date',
        required: true,
        label: 'Start Date',
        value: ''
      },
      {
        name: 'end_date',
        type: 'date',
        required: true,
        label: 'End Date',
        value: ''
      }
    ]
  };
  public createCampPer;
  public editCampPer;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(
    public campaignService: CampaignsService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    public appService: AppService,
    private snackbar: MatSnackBar // private pars:Pagination
  ) {}
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
        key: 'CAMPAIGNS'
      });
      if (i < 0) {
        this.router.navigateByUrl('access-denied');
      } else {
        this.createCampPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['CREATE_CAMPAIGN']
          : true;
        this.editCampPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['EDIT_CAMPAIGN']
          : true;
        this.tabData = this.appService.getListData('Top-Headers', 'CAMPAIGNS');
        this.getCampaings();
        this.getCampaignsAdEditFormSpecs(this.appService.configLabels[i]._id);
        this.calculateCount = true;
      }
    }
  }

  getCampaignsAdEditFormSpecs(id) {
    this.appService.getFormDeatils(id).then(res => {
      this.state.section = res.result.data.specsInfo;
    });
  }

  // Search event emitter from the search component
  onSearch(event: any): void {
    this.toggleClass = true;
    this.noData = false;
    this.params.search = event;
    this.calculateCount = true;
    this.params.pageNumber = 1;
    this.getCampaings();
  }

  // For calculating Pages Count based on the total count
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

  // To get Campaigns List Data
  getCampaings() {
    this.campaignService.getCampaigns(this.params).then(res => {
      if (!this.headersData.length) {
        this.columnDefs = this.generateColumns(res.result.data.headers);
      }
      this.rowData = res.result.data.data;
      this.totalCount = res.result.data.count;
      this.toggleClass = false;
      this.paginationData.totalCount = res.result.data.count;
      //  this.headersData = res.result.data.headers;
      this.calculatePagesCount();
      //  this.columnDefs = this.generateColumns(res.result.data.headers);
      // this.dataLoad = false;
      if (this.rowData.length) {
        this.noData = false;
      } else {
        this.noData = true;
      }
      if (res.result.success && this.gridApi) {
        this.sizeToFit();
      }
      const valueEdit = {
        headerName: '',
        pinned: 'right',
        filter: false,
        enableFilter: false,
        onCellClicked: function(params) {
          this.editProgress = true;
          params.api.selectIndex(params.node.rowIndex);
          this.selectedRow = params.api.getSelectedRows();
          this.openDailog();
        }.bind(this),
        template: '<span><em class="pixel-icons icon-pencil"></em></span>',
        width: 60
      };
      if (!this.headersData.length) {
        if (this.editCampPer) {
          this.columnDefs.push(valueEdit);
        }
      }
      this.headersData = this.headersData.length
        ? this.headersData
        : res.result.data.headers;
    });
  }

  // infinite scroll Event
  scroll() {
    // infinite Scroll
  }

  // Load more data upon pagination custom pagination
  loadMore(param) {
    // this.rowData = [];
    // this.toggleClass = true;
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
    // this.noData = false;
    // this.dataLoad = true;
    this.params.pageNumber = num;
    setTimeout(() => {
      this.rowData = [];
      this.getCampaings();
    }, 200);
  }

  /*Ag-grid  functions*/

  // calls when the grid gets ready
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridColumnApi.autoSizeColumns([
      'start_date',
      'end_date',
      'status',
      'adsInfo'
    ]);
    this.gridApi.closeToolPanel();
    this.gridApi.sizeColumnsToFit();
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
    };
    setTimeout(() => {
      this.dataLoad = false;
      this.gridVisibility = true;
      this.gridColumnApi.autoSizeColumns([
        'start_date',
        'end_date',
        'status',
        'adsInfo'
      ]);
      this.gridApi.sizeColumnsToFit();
    }, 200);
  }
  onPaginationChanged() {}

  // To fit columns to Screen
  sizeToFit() {
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    });
  }

  // when Column is resized
  onColumnResized(param) {
    // this.gridApi ? this.sizeToFit() : '';
  }

  // To generate dynamic columns in grid
  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['enableRowGroup'] = true;
      // temp['editable']= true;
      if (data[i].key === 'name') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<div class="icon-render">
            <em class="pixel-icons icon-campaigns"></em>
							<span>` +
                params.value +
                `</span>
						</div>`
            : '';
        };
      }
      if (data[i].key === 'status') {
        temp['cellClass'] = function(params) {
          return params.value
            ? params.value === 1
              ? 'status-active'
              : 'status-inactive'
            : 'status-inactive';
        };
        temp['cellRenderer'] = params => {
          const statusVal = params.value
            ? params.value === 1
              ? 'Active'
              : 'Inactive'
            : 'Inactive';
          return params
            ? `<div class="status">
							<span class="status">` +
                statusVal +
                `</span>
						</div>`
            : '';
        };
        temp['keyCreator'] = (params: { value: number | string }) => {
          if (params.value === 1) {
            return 'Active';
          } else {
            return 'Inactive';
          }
        };
      }
      if (data[i].key === 'adsInfo') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['tooltipValueGetter'] = params => params.value.adNames;
        temp['cellRenderer'] = params => {
          return params.value ? params.value.count : '';
        };
        temp['keyCreator'] = (params: {
          value: {
            adNames: string;
            count: number;
          };
        }) => {
          return params.value.count;
        };
      }
      if (data[i].type === 'date') {
        temp['cellRenderer'] = params => {
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
  /* Ag-grid End */

  // Update Campaign after edit dailog is closed
  updateCampaign(form) {
    this.editListForm.setControl('editFormValues', this.fb.array([]));
    this.getCampaings();
  }

  // To open campigns form in edit mode
  openDailog() {
    this.createForm();
    const levels = [];
    this.editMode = true;
    const select = this.selectedRow[0];
    select['start_date'] = this.formatDate(select['start_date']);
    select['end_date'] = this.formatDate(select['end_date']);
    for (let i = 0; i < this.headersData.length + 1; i++) {
      levels.push(this.selectedRow[0]);
    }
    this.editListForm.patchValue({
      editFormValues: levels
    });
    this.dialogRef = this.dialog.open(EditCampaignComponent, {
      panelClass: ['campaign-dialog', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Campaign',
        selectedRow: select,
        headersData: this.headersData,
        editListForm: this.editListForm,
        section: this.state.section
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.afterDailogClosed(result, 'updated');
    });
  }
  afterDailogClosed(result, flag) {
    if (result) {
      this.updateCampaign(result.data);
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'success',
          msg: ' Campaign ' + flag + ' Successfully'
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }
  // To change date to another format
  formatDate(param) {
    const date: Date = new Date(param);
    return date.toISOString().substring(0, 10);
  }

  /* Form BUilder Fucntions sidenav-component*/

  // To Create Form for Form Builder
  createForm(): void {
    this.editListForm = this.fb.group({
      editFormValues: this.fb.array([])
    });
    this.createControls();
  }

  // To Update Values in the form array
  public get editFormValues() {
    return this.editListForm.get('editFormValues') as FormArray;
  }

  // To Create Form Controls
  createControls() {
    this.state.section.forEach(attr => {
      this.editFormValues.push(this.createFormGroup(attr));
    });
  }

  // To create form group validations
  createFormGroup(attr) {
    if (attr.form_save_value.settings.mandatory) {
      if (attr.key == 'single_line_text') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? [
                '',
                Validators.compose([
                  Validators.required,
                  CustomValidation.noWhitespaceValidator
                ])
              ]
            : ''
        });
      } else {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ''
        });
      }
    } else {
      return this.fb.group({
        [attr.db_column_key]: ''
      });
    }
  }

  // To create campaign dailog
  createCamp() {
    this.createForm();
    const levels = [];
    this.editMode = false;
    const status = {
      status: 1
    };

    for (let i = 0; i < 10; i++) {
      levels.push(status);
    }
    this.editListForm.patchValue({
      editFormValues: levels
    });
    this.dialogRef = this.dialog.open(EditCampaignComponent, {
      panelClass: ['campaign-dialog', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Campaign',
        selectedRow: '',
        headersData: this.headersData,
        editListForm: this.editListForm,
        section: this.state.section,
        mode: 'create'
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.afterDailogClosed(result, 'created');
    });
  }
}
