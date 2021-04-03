import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  TemplateRef,
  ElementRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { AppService } from '@app/app.service';
import { SettingsService } from '@app/settings/settings.service';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { AddEditSettingsComponent } from '@app/dialogs/add-edit-settings/add-edit-settings.component';
import { SkuHistoryComponent } from '@app/dialogs/sku-history/sku-history.component';
import { ConfirmEditLabelComponent } from '@app/dialogs/confirm-edit-label/confirm-edit-label.component';
import { EditFormComponent } from '@app/dialogs/edit-form/edit-form.component';
import { AddformComponent } from '@app/dialogs/addform/addform.component';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey(
  'Enterpi_Software_Solutions_Private_Limited_MultiApp_1Devs21_August_2019__MTU2NjM0MjAwMDAwMA==f0a6adf3f22452a5a3102029b1a87a43'
);

const APP: any = window['APP'];
import * as _ from 'lodash';
import { ImportParams } from '@app/shared/utility/types';
import { DummyControls } from '@app/shared/utility/dummy.json';
import { AgCustomTemplateComponent } from '@app/shared/component/ag-custom-template/ag-custom-template.component';
import { ShowMailComponent } from '@app/dialogs/show-mail/show-mail.component';
import * as moment from 'moment';
// import { FormulaBuilderComponent } from '@app/dialogs/formula-builder/formula-builder.component';
import { continueStatement } from 'babel-types';
@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('leftAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class SettingsListComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private appService: AppService,
    private settingsService: SettingsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    protected localStorage: LocalStorage
  ) {
    activeRoute.params.subscribe(param => {
      this.settingsUrls = param.url;
      this.systemSettingsBlock = false;
      // parent based routing
      const index = _.findIndex(this.settingsList ? this.settingsList : '', {
        url: param.url
      });
      if (index > -1) {
        this.getSelectedList(this.settingsList[index], '');
      }
      // children based routing (system settings)....
      const index1 = _.findIndex(
        this.systemSettingsChild ? this.systemSettingsChild : '',
        { url: param.url }
      );
      if (index1 > -1) {
        this.systemSettingsBlock = true;
        this.getSelectedList(this.systemSettingsChild[index1], '');
      }
      this.selectedLevel = '';
    });

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

  public get settingsFormValues() {
    return this.settingsListForm.get('settingsFormValues') as FormArray;
  }
  public offerTypes = [];
  public get formValues() {
    return this.createSampleForms.get('formValues') as FormArray;
  }
  public settingsListForm: FormGroup;
  public versionSettingsForm: FormGroup;
  public createLabelsForm: FormGroup;
  public createSampleForms: FormGroup;
  public offerType_formBuilderForm: FormGroup;
  public dialogRef: any;
  public settingsList: any;
  public globalSettingsList: any;
  public previousSelectedOfferType: any;
  public data: any;
  public rolesReady = false;
  public specsReady = false;
  public formulaBuilderReady = false;
  public formStatusChanged = false; // this only works with formbuilder and offertype section.
  public rowData = [];
  public columnDefs = [];
  public tagsList = '';
  public gridApi: any;
  public gridColumnApi;
  public selectedRow = [];
  public headersData = [];
  public allAutoSizeColumns = [];
  public formData = [];
  public formCategories = [];
  public vehiclesData = [];
  public settingsUrls: any;
  public listData: any;
  public editItem = false;
  public isOpen: any;
  public formulaBuilderStatus = true;
  public versionCount: any;
  public tempVersionCount: any;
  public noData: any;
  public progress = true;
  public createOfferTypeFormReady = false;
  public totalCount: number;
  public pageCount: number;
  public numbers = [];
  public divsionsForOfferTypes = [];
  public sideBar;

  public minLimit: number;
  public maxLimit: number;
  public displayRange: number;

  public active = [];
  public calculateCount: any;
  public headersCount: any;

  // System settings block
  public systemSettingsBlock = false;
  public disableSaveBtn = true;
  public stop_outgoing_emails: string;
  public makeEmailUpdationCall = false;
  public defaultSettingValue: any;
  public defaultSettingValueCopy: any;
  public footerPagination = true;
  public rowSelection: string;

  public seeAllHistory: any;
  public skuHistoryData: any;
  public impSkuData: ImportParams = {
    samplePath: '',
    url: 'uploadSku',
    title: 'Sku',
    format: 'Excel',
    container: ''
  };

  public childData: any;
  public fetchingData = true;
  public offerTypeFormSubmitted = false;
  public formDetails: any;
  public specInfo = [];
  public selectedLevel: any;
  public modTypeColors: any;
  public tabData: any;
  public offerTypeChangeStatus: any;
  public versionCountDisabledFlag: any;
  public formList: any;
  public params = {
    column: '',
    pageNumber: 1,
    pageSize: 21,
    search: '',
    sort: 'asc'
  };
  public status = new FormControl(false);
  public offerType_form_name = new FormControl();
  public specList: any = {
    listFields: '',
    specFields: [],
    totalList: ''
  };
  public userRolesList: any = {
    userRoles: []
  };
  public editCompleted = true;
  public search = {
    placeHolder: '',
    value: ''
  };

  public delete_row: any;
  public componentLabel;
  public configurableLabelCopy = {};
  public lastIndex: number;
  public modNumberPattern = /^(0|[1-9]\d*)$/;
  @ViewChild('sidenav') public sidenav: MatSidenav;
  systemSettingsChild = [];
  headers = [];
  @ViewChild('clientTemplate') clientTemplate: TemplateRef<any>;
  @ViewChild('clientTemplate2') clientTemplate2: TemplateRef<any>;
  @ViewChild('searchingBox') searchingBox: ElementRef;
  public gridVisibility = false;

  // configuring labels
  public selectedConfigLabels: any;
  public selectedConfigLabelsCopy: any;
  public editlabel = false;
  public selectedFormLabels: any;
  public offerTypesForFormulaBuilders: any; // holds formula builder info.
  public editEmailPer;
  public editLblPer;
  public editCompanyPer;
  public editDivPer;
  public editPgTempPer;
  public editIconsPer;
  public editVehiclePer;
  ngOnInit() {
    if (!this.appService.totalConfigData.length) {
      this.appService.totalConfigData = JSON.parse(APP.systemSettings);
      this.getLabels();
    }
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'SETTINGS'
      });
      if (i < 0) {
        this.router.navigateByUrl('access-denied');
      } else {
        this.editEmailPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['EDIT_EMAIL_SETTING']
          : true;

        this.editLblPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['EDIT_LABELS']
          : true;
        this.editCompanyPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_COMPANIES']
          : true;
        this.editDivPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_DIVISIONS']
          : true;
        this.editIconsPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_ICONS']
          : true;
        this.editPgTempPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_PAGE_TEMPLATES']
          : true;
        this.editVehiclePer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_VEHICLE_TYPES']
          : true;
        this.tabData = this.appService.getListData('Top-Headers', 'SETTINGS');
        this.rowSelection = 'single';
        if (!this.globalSettingsList) {
          this.getLabels();
        }
        this.calculateCount = true;
        if (this.settingsUrls === 'form-specs') {
          // this.createSpecFields();
        }

        this.createOfferType_formBuilderForm();
        this.getDivisions();
      }
    }
  }

  getLabels() {
    if (this.appService.totalConfigData.length) {
      this.globalSettingsList = this.appService.totalConfigData;
    } else {
      this.globalSettingsList = JSON.parse(APP.systemSettings);
    }
    this.globalSettingsList.map(tabs => {
      if (tabs.key === 'Settings') {
        this.settingsList = tabs.value;
        if (!this.settingsUrls) {
          const locConfig = this.router.config.map(route =>
            Object.assign({}, route)
          );
          this.router.resetConfig(locConfig);
          this.router.navigateByUrl('settings/' + this.settingsList[0].url);
        } else {
          this.settingsList.map(getList => {
            if (getList.children) {
              this.systemSettingsChild =
                getList.key === 'SYSTEM_SETTINGS' ? getList.children : '';
              getList.children.map(childList => {
                if (childList.url === this.settingsUrls) {
                  this.getSelectedList(childList, '');
                  this.isOpen = true;
                }
              });
            }
            if (getList.url === this.settingsUrls) {
              this.getSelectedList(getList, '');
            }
          });
        }
      }
    });
  }

  getSelectedList(list, from) {
    this.getSelectedListInfo(list, from);
  }

  getSelectedListInfo(list, from) {
    if (!from) {
      this.gridVisibility = true;
    }
    if (from != 'infiniteScroll') {
      this.noData = false;
      this.progress = true;
      this.fetchingData = true;
      this.rowData = [];
      this.headersData = [];
      this.listData = list;
      this.specList.totalList = list;
      this.specList.listFields = list;
    }
    // this.createForm();
    // console.log(this.search);
    this.search = { ...this.search };
    this.search.placeHolder = 'Search ' + list.label;
    this.search = { ...this.search };
    // if (list.key === 'RMS_DIVISIONS') {
    //   this.getOfferTypes();
    // }
    if (list.key === 'VERSION_SETTINGS') {
      this.versionSettingsForm = this.fb.group({
        version_count: ''
      });
    }
    if (list.key === 'GENERAL_SETTINGS') {
      this.headers = [];
    }
    this.params.search = this.search.value;
    if (list.key === 'SKU') {
      this.params.pageSize = 5;
    } else {
      this.params.pageSize = 21;
    }
    if (list.key === 'FORM_BUILDER') {
      this.params['form_type'] = 1;
    } else if (list.key === 'OFFER_TYPES') {
      this.params['form_type'] = 2;
    } else {
      this.params['form_type'] = undefined;
    }
    this.rolesReady = false;
    this.specsReady = false;
    this.formulaBuilderReady = false;
    //   if (!this.systemSettingsBlock) {  // if parent level settings

    this.settingsService
      .getList([{ url: list.get_api }, this.params])
      .then(res => {
        this.data = res.result.data;
        this.formCategories = this.data.categories;
        if (from === 'infiniteScroll') {
          this.rowData = this.rowData.concat(res.result.data.data);
        } else {
          this.rowData = res.result.data.data;
        }
        this.totalCount = res.result.data.count;
        this.noData = true;
        this.progress = false;
        this.fetchingData = false;
        this.calculatePagesCount();

        const headers = res.result.data.headers;
        this.headers = headers;
        this.appService.getFormDeatils(list._id).then(res => {
          this.headersData = res.result.data.specsInfo;
        });
        // this.headersData = DummyControls.controlsData[list.key];
        this.headersCount = this.headersData ? this.headersData.length : '';
        if (!from) {
          // not allowing to execute if it comes from pagination.
          this.allAutoSizeColumns = [];
          this.columnDefs = this.generateColumns(headers);
          this.autoSizeColumns();
        }

        if (list.key === 'CONFIGURATIONS') {
          if (this.selectedLevel) {
            const index = _.findIndex(this.rowData, {
              key: this.selectedLevel
            });
            this.getSelectedLables(this.rowData[index]);
          } else {
            this.getSelectedLables(this.rowData[0]);
          }
          // this.createConfigLabelsForm();
        } else if (list.key === 'FORM_BUILDER' || list.key === 'OFFER_TYPES') {
          if (this.rowData.length) this.getSelectedForm(this.rowData[0]);
        } else if (list.key === 'FORMULA_BUILDER') {
          this.offerTypesForFormulaBuilders = this.rowData;
          this.formulaBuilderReady = true;
        } else if (list.key === 'FORM_SPECS') {
          this.specList.specFields = this.rowData;
          this.specsReady = true;
        } else if (list.key === 'ROLES') {
          this.userRolesList.userRoles = this.rowData;
          this.rolesReady = true;
        } else if (list.key === 'GENERAL_SETTINGS') {
          this.footerPagination = false;
          if (this.headers.length) {
            this.appendNewKeyInHeaders();
            this.defaultSettingValue = this.rowData;
            this.defaultSettingValueCopy = this.defaultSettingValue;
          }
        } else {
          // all the other options in system settings , non-General settings goes here
          this.footerPagination = true;
        }
        if (this.rowData) {
          if (this.rowData.length) {
            this.noData = false;
            this.progress = false;
          } else {
            this.noData = true;
          }
        }

        if (this.headersData) {
          // this.createForm();
        }
        if (this.headersCount <= 6) {
          setTimeout(() => {
            if (this.gridApi) {
              this.gridApi.sizeColumnsToFit();
            }
          });

          setTimeout(() => {
            this.gridVisibility = false;
          });
        }

        this.delete_row = {
          headerName: '',
          filter: false,
          pinned: 'right',
          width: 30,
          template:
            '<span class="center-aligned-icons"><em class="pixel-icons icon-delete"></em></span>',
          headerClass: 'hide-header-options',
          onCellClicked: function(params) {
            params.api.selectIndex(params.node.rowIndex);
            this.selectedRow = params.api.getSelectedRows();
            this.deleteRow(this.selectedRow[0]);
          }.bind(this)
        };

        // editing form - pencil symbol code
        const valueEdit = {
          headerName: '',
          filter: false,
          pinned: 'right',
          width: 30,
          template:
            '<span class="center-aligned-icons"><em class="pixel-icons icon-pencil"></em></span>',
          headerClass: 'hide-header-options',
          onCellClicked: function(params) {
            this.editItem = true;
            params.api.selectIndex(params.node.rowIndex);
            this.selectedRow = params.api.getSelectedRows();
            this.openForm('edit');
          }.bind(this)
        };
        if (list.is_edit === 1) {
          if (
            (list.key == 'ICONS' && this.editIconsPer) ||
            (list.key == 'COMPANIES' && this.editCompanyPer) ||
            (list.key == 'RMS_DIVISIONS' && this.editDivPer) ||
            (list.key == 'PAGE_TEMPLATES' && this.editPgTempPer) ||
            (list.key == 'VEHICLE_TYPES' && this.editVehiclePer)
          ) {
            this.columnDefs.push(valueEdit);
          } else if (
            list.key != 'ICONS' &&
            list.key != 'COMPANIES' &&
            list.key != 'RMS_DIVISIONS' &&
            list.key != 'PAGE_TEMPLATES' &&
            list.key != 'VEHICLE_TYPES'
          ) {
            this.columnDefs.push(valueEdit);
          }
        }

        if (list.is_delete === 1) {
          this.columnDefs.push(this.delete_row);
        }

        if (this.listData.key === 'VERSION_SETTINGS') {
          this.versionCount = res.result.data;
          this.setVersionCount(res.result.data);
          this.tempVersionCount = Object.assign({}, this.versionCount);
        }
        if (this.listData.key === 'SKU') {
          this.skuHistoryData = res.result.data;
          this.impSkuData.samplePath = res.result.data.samplePath;
          this.impSkuData.title = this.listData.value;
        }
      });
    //  }
  }

  selectedList(child) {
    // if (child && child.key != 'GENERAL_SETTINGS') {
    //   this.headers = [];
    // }
    this.params.pageNumber = 1;
    this.search.value = '';
    this.calculateCount = true;
  }

  calculatePagesCount() {
    if (this.calculateCount) {
      this.numbers = [];
      this.pageCount = Math.ceil(this.totalCount / this.params.pageSize);
      // this.editProgress = false;

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
    // this.dataLoad = true;
    this.gridVisibility = false;
    let num = param;
    let indx;
    for (let i = 1; i <= this.pageCount; i++) {
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
    this.minLimit = this.minLimit < 0 ? 0 : this.minLimit;
    this.active[num] = !this.active[num];
    if (this.params.pageNumber === num) {
      return 0;
    }
    this.params.pageNumber = num;
    this.getSelectedList(this.listData, 'pagination');
  }

  onSearch(event: any): void {
    this.params.pageNumber = 1; // making pageNumber  hardly to 1, to search results globally.
    this.params.search = event;
    this.search.value = event;
    this.getSelectedList(this.listData, '');
    this.calculateCount = true;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    setTimeout(() => {
      if (this.gridColumnApi) {
        this.autoSizeColumns();
      }
      if (this.headersCount <= 6) {
        this.gridApi.sizeColumnsToFit();
      }
    });

    window.onresize = () => {
      if (this.headersCount <= 6) {
        this.gridApi.sizeColumnsToFit();
      }
    };
  }

  autoSizeColumns() {
    if (this.gridColumnApi) {
      this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
    }
  }

  onColumnResize(params) {
    // this.gridApi.sizeColumnsToFit();
  }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['enableRowGroup'] = true;
      if (data[i].type === 'number') {
        this.allAutoSizeColumns.push(data[i].key);
      }
      if (data[i].key === 'offer_types') {
        temp['cellClass'] = 'offerTypeGrid';
        temp['cellRenderer'] = params => {
          // return params.value.join(",");
          const arr = [];
          if (params.value) {
            params.value.map(val => {
              const index = _.findIndex(this.offerTypes, {
                id: val
              });
              if (index > -1) {
                arr.push(
                  `<div class="type">
                <span class="grid">` +
                    this.offerTypes[index].name +
                    `</span>
              </div>`
                );
              }
            });
          }
          return arr.join('');
        };
        temp['keyCreator'] = params => {
          const arr = [];
          params.value.map(val => {
            const index = _.findIndex(this.offerTypes, {
              id: val
            });
            if (index > -1) {
              arr.push(this.offerTypes[index].name);
            }
          });
          return arr;
        };
      }
      if (data[i].type === 'image') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.value +
                `">`
            : '';
        };
      }
      if (data[i].key === 'status') {
        let stsInAct =
          this.listData.key == 'EMAIL_CONTROLLER' ? '' : 'status-inactive';
        temp['cellClass'] = function(params) {
          return params.value == 1 ? 'status-active' : stsInAct;
        };
        temp['cellRenderer'] = params => {
          let statusVal = '';
          if (this.listData.key === 'EMAIL_CONTROLLER') {
            statusVal = params.value === 1 ? 'Sent' : '';
          } else {
            statusVal = params.value === 1 ? 'Active' : 'Inactive';
          }
          return params
            ? `<div class="status">
							<span class="status">` +
                statusVal +
                `</span>
						</div>`
            : '';
        };
        temp['keyCreator'] = (params: { value: number | string }) => {
          if (params.value == 1) {
            return 'Active';
          } else {
            return 'Inactive';
          }
        };
      }
      // system - settings logic goes here
      if (data[i].name === 'SEND MAIL') {
        temp['cellRendererFramework'] = AgCustomTemplateComponent;
        temp['cellRendererParams'] = {
          ngTemplate: this.clientTemplate2
        };
      }
      if (data[i].name === 'SHOW MAIL') {
        temp['cellRendererFramework'] = AgCustomTemplateComponent;
        temp['cellRendererParams'] = {
          ngTemplate: this.clientTemplate
        };
      }
      temp['tooltipValueGetter'] = function(params) {
        if (data[i].key == 'status') {
          if (params.value == 1) {
            return 'Active';
          } else {
            return 'Inactive';
          }
        } else {
          return params.value;
        }
      };
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }

  deleteRow(data) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      // disableClose: true,
      data: { rowData: this.listData, selectedRow: this.selectedRow[0] }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: this.listData.label + ' Deleted Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.getSelectedList(this.listData, '');
      }
    });
  }

  createForm() {
    // settings list form.
    this.settingsListForm = this.fb.group({
      settingsFormValues: this.fb.array([])
    });
    this.createControls();
  }

  createOfferType_formBuilderForm() {
    this.createOfferTypeFormReady = false;
    this.offerType_formBuilderForm = this.fb.group({
      offerType_formBuilder_name: ['', Validators.required],
      offerType_formBuilder_keyword: [''],
      offerType_formBuilder_status: ['', Validators.required],
      offerType_divisions: ['', Validators.required]
    });
  }

  createControls() {
    let i = 0;
    this.headersData.forEach(attr => {
      this.settingsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
  }

  createFormGroup(data, idx) {
    if (data.key === 'dropdown' || data.key === 'multiple_choice') {
      if (data.get_api) {
        this.appService.getDropdownOptions(data.get_api, '').then(res => {
          data.options = res.result.data.data;
          this.headersData[idx].options = res.result.data.data;
        });
      }
    }
    if (data.db_column_key === 'no_of_mods') {
      return this.fb.group({
        [data.db_column_key]: [
          '',
          [
            data.form_save_value.settings.mandatory
              ? Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(100),
                  Validators.pattern(this.modNumberPattern)
                ])
              : ''
          ]
        ]
      });
    } else {
      return this.fb.group({
        [data.db_column_key]: data.form_save_value.settings.mandatory
          ? ['', [Validators.required]]
          : ''
      });
    }
  }

  setVersionCount(data): void {
    this.versionSettingsForm.patchValue({
      version_count: data.version_count
    });
  }

  editList(type, data, selectedRow): void {
    // this.setForm(data, selectedRow);
  }

  add(data) {
    this.editItem = false;
    // this.settingsListForm.reset();
    this.openForm('add', data);
  }

  getVehiclesList() {
    this.settingsService
      .getList([{ url: 'getAdTypes' }, { pageNumber: 1 }])
      .then(res => {
        // this.setForm();
        this.vehiclesData = res.result.data.data;
      });
  }
  // opening add-edit settings form in modal
  openForm(type, data) {
    this.openAddEditSettingForm(type, data, '');
  }

  openAddEditSettingForm(type, data, res) {
    const panelClass =
      this.listData.key === 'ICONS' ? 'add-edit-icons' : 'add-edit';
    this.dialogRef = this.dialog.open(AddEditSettingsComponent, {
      panelClass: [panelClass, 'overlay-dialog'],
      width: '500px',
      data: {
        listData: this.listData,
        selectedRow: this.selectedRow[0],
        headersData: this.headersData,
        // formList: this.formList,
        assignId: data,
        //  settingsListForm: this.settingsListForm,
        vehiclesData: this.vehiclesData,
        // modColors: res ? res.result.data : [],
        type: type,
        offerTypes: this.offerTypes
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // this.settingsListForm.setControl(
        //   'settingsFormValues',
        //   this.fb.array([])
        // );
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg:
              this.listData.label +
              (type === 'edit' ? ' Updated' : ' Added') +
              ' Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.getSelectedList(this.listData, '');
      }
    });
  }

  resetInfo() {
    // this.createForm();
  }

  closeSideNav() {
    this.sidenav.close();
  }

  updateList(form) {
    const obj = {};
    if (this.selectedRow[0]) {
      obj['id'] = this.selectedRow[0].id;
    }
    form.value.settingsFormValues.forEach(item => {
      Object.assign(obj, item);
    });
    this.settingsService
      .updateItem([{ url: this.listData.create_api }, obj])
      .then(res => {
        if (res.result.success) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg:
                this.listData.label +
                (this.selectedRow[0] ? ' Updated ' : ' Added ') +
                'Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.getSelectedList(this.listData, '');
          this.closeSideNav();
        }
      });
  }

  dropdownTrigger(ev, list) {
    this.isOpen = !this.isOpen;
  }

  updateVersionCount(form, listData) {
    this.settingsService
      .getList([{ url: listData.get_api }, form.value])
      .then(res => {
        if (res.result.success) {
          this.tempVersionCount = form.value;
          this.versionCountDisabledFlag = true;
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Version Settings Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
  }

  resetVersionCount() {
    this.setVersionCount(this.tempVersionCount);
    this.versionCountDisabledFlag = true;
  }

  changeCount() {
    this.versionCountDisabledFlag = false;
  }

  modNumber(event: any) {
    const pattern = /^\d+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  seeTotalImportHistory(api, data) {
    // this.seeAllHistory = true;
    const params = {
      pageNumber: 1,
      pageSize: 10
    };
    this.settingsService.getSkuHistory(api, params).then(res => {
      this.dialogRef = this.dialog.open(SkuHistoryComponent, {
        panelClass: ['sku-history', 'overlay-dialog'],
        width: '900px',
        data: {
          history: res.result.data.data,
          api: api,
          count: res.result.data.count
        }
      });
      this.dialogRef.afterClosed().subscribe(result => {});
    });
  }

  importSuccess(param) {
    if (param.status) {
      this.getSelectedList(this.listData, '');
    }
  }

  getSelectedLables(data) {
    this.editCompleted = true;
    this.selectedConfigLabels = data;
    this.selectedLevel = data.key;
    this.selectedConfigLabels.value.forEach(label => {
      label.edit = false;
    });
    this.selectedConfigLabelsCopy = Object.assign(
      {},
      this.selectedConfigLabels
    );
  }

  editLabel(configLabel) {
    this.editCompleted = false;
    this.selectedConfigLabels.value.forEach(label => {
      if (label._id === configLabel._id) {
        label.edit = true;
      } else {
        label.edit = false;
      }
    });
    this.configurableLabelCopy = Object.assign({}, configLabel);
  }

  saveLabel(field) {
    this.dialogRef = this.dialog.open(ConfirmEditLabelComponent, {
      panelClass: ['edit-config-label', 'overlay-dialog'],
      width: '600px',
      data: {
        configData: { value: field.value, id: field._id }
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Label Updated Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });

        // updating secondary menu
        if (this.selectedLevel === 'settings') {
          const index = _.findIndex(this.settingsList, { _id: field._id });
          this.settingsList[index].value = field.value;
        } else if (this.selectedLevel === 'top-headers') {
          const index = _.findIndex(this.appService.configLabels, {
            _id: field._id
          });
          this.appService.configLabels[index].value = field.value;
        } else if (this.selectedLevel === 'others') {
          const index = _.findIndex(this.appService.subHeaders, {
            _id: field._id
          });
          this.appService.subHeaders[index].value = field.value;
        }
        //  this.configurableLabelCopy = {};
        field.edit = false;
        this.editCompleted = true;
      }
    });
  }

  discardLabel(field) {
    if (this.configurableLabelCopy['value'] !== field.value) {
      field.value = this.configurableLabelCopy['value'];
    }
    field.edit = false;
    this.editCompleted = true;
  }

  deleteSpec(spec) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      // disableClose: true,
      data: {
        rowData: { delete_api: 'deleteOfferType', data: spec },
        mode: 'delete',
        action: 'deleteSpec',
        label: spec.name
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: spec.name + ' Deleted Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        // this.getSelectedForm(this.selectedFormLabels);
        this.getOfferTypes();
      }
    });
  }
  getOfferTypes() {
    let params = {
      column: '',
      pageNumber: 1,
      pageSize: 200,
      search: '',
      sort: 'asc',
      form_type: 2
    };

    this.settingsService.getForms(params).then(res => {
      if (res.result.success) {
        if (res.result.data.count) {
          this.rowData = res.result.data.data;
          this.getSelectedForm(res.result.data.data[0]);
        }
      }
    });
  }
  /* Form Builder */
  createFormFields() {
    this.createSampleForms = this.fb.group({
      formValues: this.fb.array([])
    });
    this.createFormControls();
  }

  createFormControls() {
    this.formData.forEach(attr => {
      this.formValues.push(
        this.fb.group({
          [attr.label]: ''
        })
      );
    });
  }
  public c = [];

  getSelectedForm(data) {
    if (
      this.previousSelectedOfferType &&
      this.previousSelectedOfferType.id === data.id &&
      this.previousSelectedOfferType.name ===
        this.offerType_formBuilderForm.value.offerType_formBuilder_name
    ) {
      return;
    } else {
      this.previousSelectedOfferType = data;
      this.formStatusChanged = false;
      this.offerTypeFormSubmitted = false;
      this.selectedFormLabels = data;
      const params = {
        form_id: data.id || ''
      };
      this.fetchingData = true;
      this.settingsService.formDetails(params).then(res => {
        const specData = res.result.data;
        this.formData = specData.specsInfo;
        this.formDetails = specData;
        this.selectedFormLabels = specData.data;
        this.createFormFields();
        if (this.offerType_formBuilderForm) {
          this.offerType_formBuilderForm.reset();
        }
        this.createOfferType_formBuilderForm();
        const obj = {},
          arr = [];
        this.formData.forEach(attr => {
          obj[attr.label] = '';
          arr.push(obj);
        });
        this.createSampleForms.patchValue({
          formValues: arr
        });
        this.fetchingData = false;
        this.offerType_formBuilderForm.patchValue({
          offerType_formBuilder_status: this.selectedFormLabels.status,
          offerType_formBuilder_name: this.selectedFormLabels.name,
          // offerType_formBuilder_keyword: this.selectedFormLabels.name.join(' | '),

          offerType_divisions: this.selectedFormLabels.division_id
        });

        if (this.selectedFormLabels.key_words.length) {
          this.tagsList = this.selectedFormLabels.key_words.join(' | ');
        }

        // console.log(this.tagsList)

        // if( this.selectedFormLabels.key_words.length) {
        //   this.selectedFormLabels.key_words.forEach(element => {

        //     // let arr = [];
        //     console.log(element)

        //     // arr.push(element + '|')
        //     // let a = element + '|'

        //     let a = element;
        //     a = a + element + '|'
        //     this.tagsList = a;

        //   });
        // }
        //  let a = this.tagsList.split(',');
        //  a.forEach(obj => {
        //    let b = [];
        //    b.push(obj + '|')
        //    console.log(b)

        //    this.c = b;
        //  })

        // for(let i = 0; i < this.selectedFormLabels.key_words.length; i++) {
        //   this.a = this.a + this.selectedFormLabels.key_words[i] + '|';
        // }

        // console.log(this.a)
        // this.tagsList = this.a;

        setTimeout(() => {
          this.createOfferTypeFormReady = true;
        });

        this.offerType_formBuilderForm.valueChanges.subscribe(value => {
          if (
            value.offerType_divisions ||
            value.offerType_formBuilder_name ||
            value.offerType_formBuilder_status
          )
            this.formStatusChanged = true;
        });

        // this.createSampleForms.disable();

        // side menu value updating after update done
        let id = this.selectedFormLabels.id;
        let index = _.findIndex(this.rowData, function(o) {
          return o.id == id;
        });
        this.rowData[index].name = this.selectedFormLabels.name;
      });
    }
  }

  getSelectedFormulaBuilder(data) {
    this.offerTypesForFormulaBuilders = data;
  }

  editForm(obj) {
    this.dialogRef = this.dialog
      .open(EditFormComponent, {
        panelClass: 'editform-dialog',
        width: '600px',
        data: {
          title: obj.name,
          id: obj.id,
          formData: this.formData,
          createSampleForms: this.createSampleForms,
          key: this.listData.key,
          keyword: this.selectedFormLabels.key_words
        }
      })
      .afterClosed()
      .subscribe(res => {
        if (res && res.from) {
          this.formData = res.data;
          this.createSampleForms = res.form;
          // this.settingsService.formDetails({form_id: res.data.id}).then(res => {
          //   let specData = res.result.data;
          //   this.formData = specData.specsInfo;
          // });
        }
      });
  }

  valChanged(event) {
    if (event.data === ' ') {
      this.tagsList = event.target.value + '|';
    }
  }

  addForm(type) {
    if (type === 'create') {
      // add offer type and  forms creation...
      this.dialogRef = this.dialog.open(AddformComponent, {
        panelClass: ['add-edit', 'overlay-dialog'],
        width: '500px',
        data: { categories: this.formCategories, listData: this.listData }
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result && result.data.success) {
          // this.getSelectedList(this.listData, '');
          this.showSnackBarForFormsAndOfferTypes('Created', true, '');
          this.rowData.unshift(result.data.data.data);

          this.getSelectedForm(result.data.data.data);
          if (result.formValue.form_type === 1) {
            this.createSampleForms.reset();
          }
          setTimeout(() => {
            this.editForm(result.data.data.data);
          }, 50);
        } else {
          if (result) {
            this.showSnackBarForFormsAndOfferTypes(
              'Created',
              false,
              result.result.data
            );
          }
        }
      });
    } else {
      //edit mode
      this.offerTypeFormSubmitted = true;
      if (
        this.listData.key == 'FORM_BUILDER' ||
        this.listData.key == 'OFFER_TYPES'
      ) {
        this.offerType_formBuilderForm.removeControl('offerType_divisions');
      }
      if (this.offerType_formBuilderForm.valid) {
        this.selectedFormLabels.name = this.offerType_formBuilderForm.value.offerType_formBuilder_name;

        this.selectedFormLabels.status = this.offerType_formBuilderForm.value.offerType_formBuilder_status;

        this.selectedFormLabels.division_id =
          this.listData.key === 'OFFER_TYPES'
            ? this.offerType_formBuilderForm.value.offerType_divisions
            : undefined;

        this.settingsService
          .createForm({
            form_assign_id: this.selectedFormLabels.form_assign_id,
            form_type: this.listData.key === 'OFFER_TYPES' ? 2 : 1,
            name: this.offerType_formBuilderForm.value
              .offerType_formBuilder_name,
            status: this.offerType_formBuilderForm.value
              .offerType_formBuilder_status,
            id: this.selectedFormLabels.id,
            key_words: this.offerType_formBuilderForm.value.offerType_formBuilder_keyword.split(
              '|'
            ),
            division_id:
              this.listData.key === 'OFFER_TYPES'
                ? this.offerType_formBuilderForm.value.offerType_divisions
                : undefined
          })
          .then(response => {
            if (response.result.success) {
              this.showSnackBarForFormsAndOfferTypes('Updated', true, '');
              this.getSelectedForm(this.selectedFormLabels);
              this.formStatusChanged = false;
            } else {
              this.showSnackBarForFormsAndOfferTypes(
                'Updated',
                false,
                response.result.data
              );
            }
            this.offerTypeFormSubmitted = false;
          });
      }
    }
  }

  showSnackBarForFormsAndOfferTypes(type, caseType, msg) {
    if (caseType) {
      let formType =
        this.listData.key === 'OFFER_TYPES' ? 'Offer Type ' : 'Form ';
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'success',
          msg: formType + type + ' Successfully'
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    } else {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'fail',
          msg: msg
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  /** system settings logix goes here */
  check(option, event) {
    this.disableSaveBtn = false;
    if (option.stop_outgoing_emails === 'yes') {
      // send emails case
      this.stop_outgoing_emails = 'yes';
    } else {
      // stop all outgoing mails case
      this.stop_outgoing_emails = 'no';
    }
    if (this.stop_outgoing_emails === this.rowData['stop_outgoing_emails']) {
      this.makeEmailUpdationCall = false;
    } else {
      this.makeEmailUpdationCall = true;
    }
  }

  saveGeneralSettings() {
    this.disableSaveBtn = true;
    if (this.makeEmailUpdationCall) {
      this.settingsService
        .getList([
          { url: this.listData.get_api },
          { stop_outgoing_emails: this.stop_outgoing_emails }
        ])
        .then(res => {
          this.rowData = res.result.data.data;
          this.headers = res.result.data.headers;
          this.appendNewKeyInHeaders();
          this.makeEmailUpdationCall = false;
          if (res.result.success) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: this.listData.value + ' Updated Successfully'
              },
              duration: 1000,
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        });
    }
  }
  resetGeneralSettings() {
    this.disableSaveBtn = true;
    this.getSelectedList(this.listData, '');
  }

  appendNewKeyInHeaders() {
    this.headers.forEach(element => {
      if (element.name === 'Send Emails') {
        element.stop_outgoing_emails = 'no';
      }
      if (element.name === 'Stop all outgoing mails') {
        element.stop_outgoing_emails = 'yes';
      }
    });
  }
  sendMail() {
    setTimeout(() => {
      this.settingsService
        .sendEmail({ id: this.selectedRow['id'] })
        .then(res => {
          if (res.result.success) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Email Sent Successfully'
              },
              duration: 1000,
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            const id = this.selectedRow['id'];
            const rowNode = this.gridApi.getRowNode(id);
            rowNode.setDataValue('status', 1);
            rowNode.setDataValue(
              'sent_date',
              moment(new Date()).format('MMM DD, YYYY hh:mm A')
            );
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Mail sending Failed...'
              },
              duration: 1000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: 'warning'
            });
          }
        });
    }, 25);
  }

  showMail() {
    let showMailUrl;
    if (this.listData.key === 'EMAIL_CONTROLLER') {
      showMailUrl = 'showEmailControllerMessage';
    }
    if (this.listData.key === 'SENT_MAILS') {
      showMailUrl = 'showEmailDetailsMessage';
    }
    setTimeout(() => {
      this.settingsService
        .showEmail([{ url: showMailUrl }, { id: this.selectedRow['id'] }])
        .then(res => {
          if (res.result.success) {
            this.dialogRef = this.dialog.open(ShowMailComponent, {
              panelClass: ['add-edit', 'show-mail'],
              width: '500px',
              data: {
                data: res.result.data
              }
            });
            this.dialogRef.afterClosed().subscribe(result => {});
          }
        });
    }, 500);
  }
  onSelectionChanged(event) {
    const selectedRows = this.gridApi.getSelectedRows();
    this.selectedRow = selectedRows[0];
  }

  // import Excel Dailog

  afterDailogClose(result, data) {
    if (result.from !== 'close') {
      this.calculateCount = true;
      this.params.pageNumber = 1;
      this.getSelectedList(data, '');
    }
  }

  getDivisions() {
    this.settingsService
      .getList([{ url: 'getDivisions' }, this.params])
      .then(res => {
        this.divsionsForOfferTypes = res.result.data.data;
      });
  }
  resetOfferFormValues() {
    this.offerType_formBuilderForm.patchValue({
      offerType_formBuilder_status: this.selectedFormLabels.status,
      offerType_formBuilder_name: this.selectedFormLabels.name,
      offerType_divisions: this.selectedFormLabels.division_id
    });
    setTimeout(() => {
      this.formStatusChanged = false;
    });
  }
  onScroll(element) {
    this.params.pageNumber = this.params.pageNumber + 1;
    this.getSelectedListInfo(this.listData, 'infiniteScroll');
  }
}
