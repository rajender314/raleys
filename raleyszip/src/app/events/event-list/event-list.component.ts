import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import {
  MatSidenav,
  MatDialog,
  MatDatepicker,
  MatSnackBar
} from '@angular/material';
import { EventsService } from '@app/events/events.service';

import * as _ from 'lodash';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EditCampaignComponent } from '@app/dialogs/edit-campaign/edit-campaign.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventListComponent implements OnInit {
  public structureValues: FormGroup;
  public editListForm: FormGroup;
  public filterValues: FormGroup;
  public search = {
    placeHolder: 'Search Event',
    value: ''
  };
  public gridApi;
  public gridColumnApi;
  public rowData = [];
  public columnDefs = [];
  public selectedRow = [];
  public params = {
    search: '',
    pageSize: 20,
    pageNumber: 1,
    start_date: '',
    end_date: ''
  };
  dataLoad = true;
  noData = false;
  calculateCount = true;
  numbers = [];
  active = [];
  pageCount: number;
  totalCount: number;
  minLimit: number;
  maxLimit: number;
  displayRange: number;
  private rowBuffer;
  private rowSelection;
  private rowModelType;
  private paginationPageSize;
  private cacheOverflowSize;
  private maxConcurrentDatasourceRequests;
  private infiniteInitialRowCount;
  private maxBlocksInCache;
  public dialogRef: any;
  public campaignData = [];
  public eventTypes = [];
  public state = {
    section: [
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Event Name',
        value: ''
      },
      {
        name: 'event_type',
        type: 'select',
        required: true,
        label: 'Event Type',
        value: '',
        options: this.eventTypes
      },
      {
        name: 'campaign',
        type: 'select',
        required: true,
        label: 'Campaign',
        value: '',
        options: this.campaignData
      },
      {
        name: 'regional_shifts',
        type: 'text',
        required: '',
        label: 'Regional Shifts',
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
        required: '',
        label: 'Status',
        value: ''
      },
      {
        name: 'summary',
        type: 'textarea',
        required: '',
        label: 'Summary',
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
    ],
    eventTypes: [],
    campaignData: []
  };
  @ViewChild('sidenav') public sidenav: MatSidenav;
  constructor(
    public eventsService: EventsService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public CampaignService: CampaignsService,
    private http: HttpClient,
    private snackbar: MatSnackBar
  ) {
    this.rowBuffer = 0;
    this.rowSelection = 'multiple';
    this.rowModelType = 'infinite';
    this.paginationPageSize = 30;
    this.cacheOverflowSize = 2;
    this.maxConcurrentDatasourceRequests = 1;
    this.infiniteInitialRowCount = 1000;
    this.maxBlocksInCache = 15;
  }

  ngOnInit() {
    this.getEvents();
    this.createForm();
    this.getCampaingData();
    this.getEventTypes();
  }

  onSearch(event: any): void {
    this.params.search = event;
    this.getEvents();
  }
  calculatePagesCount() {
    if (this.calculateCount) {
      this.pageCount = this.totalCount / this.params.pageSize;
      this.pageCount = Math.ceil(this.pageCount);
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
  getEvents() {
    this.eventsService.getEvents(this.params).then(res => {
      this.rowData = res.result.data.data;
      this.totalCount = res.result.data.count;
      this.calculatePagesCount();
      this.createControls();
      this.columnDefs = this.generateColumns(res.result.data.headers);
      this.dataLoad = false;
      if (this.rowData.length) {
        this.noData = true;
      } else {
        this.noData = false;
      }
      if (res.result.success && this.gridApi) {
        this.sizeToFit();
      }
      const valueEdit = {
        headerName: '',
        pinned: 'right',

        onCellClicked: function(params) {
          params.api.selectIndex(params.node.rowIndex);
          this.selectedRow = params.api.getSelectedRows();

          this.openDailog();
        }.bind(this),
        template: '<span><em class="pixel-icons icon-pencil"></em></span>',
        width: 40
      };
      this.columnDefs.push(valueEdit);
    });
  }
  getCampaingData() {
    this.CampaignService.getCampaigns(this.params).then(res => {
      this.campaignData = res.result.data.data;
    });
  }
  getEventTypes() {
    const sortObj = { sortBy: 'from', type: 'asc' };
    const params = {
      // status: status,
      sortBy: sortObj.sortBy,
      type: sortObj.type,
      search: '',
      pageSize: 40,
      pageNumber: 1
    };
    this.eventsService.getEventTypes(params).then(res => {
      this.eventTypes = res.result.data.data;
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function(column) {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
    this.gridApi.sizeColumnsToFit();
  }
  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      if (data[i].key === 'name') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<div class="icon-render">
            <em class="pixel-icons icon-events"></em>
							<span>` +
                params.value +
                `</span>
						</div>`
            : '';
        };
      }
      if (data[i].key === 'status') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = function(params) {
          return params.value
            ? params.value === 1
              ? 'status-active'
              : 'status-inactive'
            : '';
        };
        temp['cellRenderer'] = params => {
          const statusVal = params.value
            ? params.value === 1
              ? 'Active'
              : 'Inactive'
            : '';
          return params
            ? `<div class="status">
            <span class="status">` +
                statusVal +
                `</span>
						</div>`
            : '';
        };
      }
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  loadMore(param) {
    this.dataLoad = true;
    let num = param;
    let indx;
    for (let i = 1; i <= 10; i++) {
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
    // if(param == 'prev'){

    // }
    for (let i = 1; i <= this.pageCount; i++) {
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
    this.getEvents();
  }
  sizeToFit() {
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    });
  }
  onColumnResized(param) {
    // this.gridApi ? this.sizeToFit() : '';
  }
  updateEvent(form) {
    const obj = {};
    obj['id'] = this.selectedRow[0].id;
    form.value.editFormValues.forEach(item => {
      Object.assign(obj, item);
    });
    this.eventsService.createEvent(obj).then(res => {
      if (res.result.success) {
        // this.editProgress = false;
        this.editListForm.setControl('editFormValues', this.fb.array([]));
        this.getEvents();
      }
    });
  }

  openDailog() {
    const levels = [];
    const select = this.selectedRow[0];
    this.editListForm.reset();
    select['start_date'] = this.formatDate(select['start_date']);
    select['end_date'] = this.formatDate(select['end_date']);
    this.rowData.forEach(val => {
      levels.push(this.selectedRow[0]);
    });
    this.editListForm.patchValue({
      editFormValues: levels
    });
    this.dialogRef = this.dialog.open(EditCampaignComponent, {
      panelClass: 'campaign-dialog',
      width: '600px',
      data: {
        title: 'Event',
        selectedRow: select,
        // headersData: this.headersData,
        editListForm: this.editListForm,
        section: this.state.section,
        campaignData: this.campaignData,
        eventTypes: this.eventTypes
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateEvent(result.data);
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: ' Event Updated Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }
  formatDate(param) {
    const date: Date = new Date(param);
    return date.toISOString().substring(0, 10);
  }
  createForm(): void {
    this.editListForm = this.fb.group({
      editFormValues: this.fb.array([])
    });
  }
  public get editFormValues() {
    return this.editListForm.get('editFormValues') as FormArray;
  }
  createControls() {
    this.state.section.forEach(attr => {
      this.editFormValues.push(
        this.fb.group({
          [attr.name]: ''
        })
      );
    });
  }
}
