import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AppService } from '@app/app.service';
import { Router } from '@angular/router';
import { AdsService } from '@app/ads/ads.service';
import { MatDatepicker, MatSnackBar, MatDialog } from '@angular/material';
import * as moment from 'moment';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { ErrorMessages } from '@app/shared/utility/error-messages';

import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';
import { AdPreviewComponent } from '@app/dialogs/ad-preview/ad-preview.component';
import { UsersService } from '@app/users/users.service';
import { CustomAttributesComponent } from '@app/dialogs/custom-attributes/custom-attributes.component';
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
const APP: any = window['APP'];

@Component({
  selector: 'app-ad-details',
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss'],
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
export class AdDetailsComponent implements OnInit {
  public adDetailsForm: FormGroup;
  public subheadersList: any;
  public dialogRef: any;
  public fetchingData = true;
  public campaignData = [];
  public ErrorMessages: any;
  public channelTypes = [];
  public divisionsList = [];
  public configData = {
    label: '',
    icon: ''
  };
  public errorMsg = '';
  public state = {
    section: []
  };
  public params = {
    search: '',
    pageSize: 20,
    id: '',
    pageNumber: 1
  };
  public minDate = {
    live_dates: moment(''),
    start_date: new Date(),
    end_date: '',
    break_date: moment(new Date()).add(1, 'days')['_d'],
    first_proof: moment(new Date()).add(1, 'days')['_d'],
    second_proof: moment(new Date()).add(1, 'days')['_d'],
    final_proof: moment(new Date()).add(1, 'days')['_d']
  };
  public maxDate = {
    live_dates: moment(new Date()).add(15, 'days'),
    start_date: '',
    end_date: '',
    break_date: '',
    first_proof: '',
    second_proof: '',
    final_proof: ''
  };
  public disableStatus = {
    start_date: false,
    end_date: false,
    break_date: true,
    first_proof: true,
    second_proof: true,
    final_proof: true,
    first_proof_date: false,
    second_proof_date: true,
    third_proof_date: true
  };
  range: Range = { fromDate: new Date(), toDate: new Date() };
  rangeOptions: NgxDrpOptions;
  presets: Array<PresetItem> = [];

  @ViewChild('dateRangePicker') dateRangePicker;
  public submitted = false;
  public formData;
  public marketsList;
  public footerView = false;
  public editAddPer;
  public delAddPer;
  public exportAddPer;
  public formReady = false;
  public channelTypeIds = [];
  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    public adsService: AdsService,
    private campaignService: CampaignsService,
    private router: Router,
    private snackbar: MatSnackBar,
    private dailog: MatDialog,
    private userService: UsersService
  ) {
    this.ErrorMessages = ErrorMessages;
  }

  ngOnInit() {
    this.adsService.hideHeader = false;
    this.formReady = false;
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
      } else {
        this.editAddPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['EDIT_ADS']
          : true;
        this.delAddPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['DELETE_ADS']
          : true;
        this.exportAddPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['EXPORT_AD_DATA']
          : true;
        // this.getChannels();
        // this.getCampaings();
        // this.getDivisons();
        const currentTabData = this.appService.getListData(
          'Others',
          'AD_DETAILS'
        );
        const formData = this.appService.getListData('Top-Headers', 'ADS');
        this.appService.getFormDeatils(formData._id).then(res => {
          this.state.section = res.result.data.specsInfo;
          this.createForm();
          this.getAdDetails(currentTabData);
        });
        this.router.navigateByUrl(
          'vehicles/' + this.appService.adId + '/' + currentTabData.url
        );
      }
    }
    this.rangeOptions = {
      presets: this.presets,
      format: 'mediumDate',
      range: { fromDate: new Date(), toDate: new Date() },
      applyLabel: 'Submit',
      placeholder: ''
    };
  }

  displayFn(state) {
    return state.value;
  }
  getDivisons() {
    let app = JSON.parse(APP['loginDetails']);
    const userData = app.user_data;
    this.userService
      .getDivisions({ user_id: userData.id, status: 1 })
      .then(res => {
        this.divisionsList = res.result.data.data;
      });
  }
  createForm(): void {
    this.adDetailsForm = this.fb.group({
      adDetailsFormValues: this.fb.array([])
    });
    this.createControls();
  }

  public get adDetailsFormValues() {
    return this.adDetailsForm.get('adDetailsFormValues') as FormArray;
  }
  createControls() {
    let i = 0;
    this.state.section.forEach(attr => {
      this.adDetailsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    this.formReady = true;
    console.log(this.adDetailsForm);
  }
  createFormGroup(attr, idx) {
    if (attr.key === 'dropdown' || attr.key === 'multiple_choice') {
      if (attr.get_api) {
        this.appService.getDropdownOptions(attr.get_api, '').then(res => {
          attr.options = res.result.data.data;
          this.state.section[idx].options = res.result.data.data;
        });
      }
    }
    if (attr.form_save_value.settings.mandatory) {
      if (attr.db_column_key === 'week_no') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? [
                '',
                Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(53),
                  Validators.pattern('^[0-9]*$')
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
  getAdDetails(list) {
    this.configData['label'] = list.value;
    this.configData['icon'] = list.iconClass;
    const levels = [];
    this.params.id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        this.formData = res.result.data;
        this.appService.pagesInfo = res.result.data.pages_details;
        // this.formData = {
        //   banner_id: '',
        //   channel_id: '',
        //   first_proof_date: '2019-09-04',
        //   id: '',
        //   live_dates: { startDate: '2019-09-18', endDate: '2019-10-25' },
        //   second_proof_date: '2019-09-27',
        //   third_proof_date: '2019-09-24',
        //   unique_ad_id: '',
        //   vehicle: 'Test Ad987',
        //   vehicle_type: '',
        //   week_no: '45'
        // };

        this.marketsList = res.result.data.markets;
        // this.formData['start_date'] = moment(this.formData['start_date']);
        // this.formData['first_proof_date'] = moment(this.formData['first_proof_date']);
        // this.formData['second_proof_date'] = moment(this.formData['second_proof_date']);
        // this.formData['final_proof_date'] = moment(this.formData['final_proof_date']);
        // this.formData['break_date'] = moment(this.formData['break_date']);
        // this.formData['end_date'] = moment(this.formData['end_date']);
        this.formData['start_date'] = new Date(this.formData['start_date']);
        this.formData['first_proof_date'] = this.formData['first_proof_date']
          ? moment(this.formData['first_proof_date']).toISOString()
          : '';
        if (this.formData['first_proof_date']) {
          this.disableStatus['second_proof_date'] = false;
        }
        this.formData['second_proof_date'] = this.formData['second_proof_date']
          ? moment(this.formData['second_proof_date']).toISOString()
          : '';
        if (this.formData['second_proof_date']) {
          this.disableStatus['third_proof_date'] = false;
        }
        // this.formData['final_proof_date'] = moment(
        //   this.formData['final_proof_date']
        // );
        this.formData['third_proof_date'] = this.formData['third_proof_date']
          ? moment(this.formData['third_proof_date']).toISOString()
          : '';
        // this.formData['break_date'] = moment(this.formData['break_date']);
        // this.formData['end_date'] = moment(this.formData['end_date']);
        this.formData['live_dates'].startDate = moment(
          this.formData['live_dates'].startDate
        ).format('MM/DD/YYYY');
        this.formData['live_dates'].endDate = moment(
          this.formData['live_dates'].endDate
        ).format('MM/DD/YYYY');
        // this.minDate['live_dates'] =  moment(this.minDate['live_dates']).format('YYYY-MM-DD');
        // this.minDate['live_dates'] = moment(
        //   this.formData['live_dates'].startDate
        // );
        this.appService.getDropdownOptions('getChannelTypes', {}).then(res => {
          this.channelTypeIds = res.result.data.data;
        });
        // this.formData['']
        for (let i = 0; i < 20; i++) {
          levels.push(this.formData);
        }
        this.adDetailsForm.patchValue({
          adDetailsFormValues: levels
        });
        console.log(this.adDetailsForm);

        this.footerView = false;

        this.minDate['start_date'] = moment(this.formData['start_date']).add(
          0,
          'days'
        )['_d'];
        // this.minDate['first_proof_date'] = moment(
        //   this.minDate['live_dates']
        // ).add(0, 'days')['_d'];

        this.minDate['second_proof_date'] = moment(
          this.formData['first_proof_date']
        ).add(1, 'days')['_d'];
        this.minDate['third_proof_date'] = moment(
          this.formData['second_proof_date']
        ).add(1, 'days')['_d'];

        this.minDate['break_date'] = moment(
          this.formData['final_proof_date']
        ).add(1, 'days')['_d'];
        this.minDate['first_proof'] = moment(this.formData['start_date']).add(
          1,
          'days'
        )['_d'];
        this.minDate['second_proof'] = moment(
          this.formData['first_proof_date']
        ).add(1, 'days')['_d'];
        this.minDate['final_proof'] = moment(
          this.formData['second_proof_date']
        ).add(1, 'days')['_d'];
        this.maxDate['start_date'] = moment(
          this.formData['first_proof_date']
        ).subtract(1, 'days')['_d'];
        this.maxDate['break_date'] = moment(this.formData['end_date']).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['first_proof_date'] = this.formData['second_proof_date']
          ? moment(this.formData['second_proof_date']).subtract(1, 'days')['_d']
          : '';
        this.maxDate['second_proof_date'] = this.formData['third_proof_date']
          ? moment(this.formData['third_proof_date']).subtract(1, 'days')['_d']
          : '';

        this.maxDate['first_proof'] = moment(
          this.formData['second_proof_date']
        ).subtract(1, 'days')['_d'];
        this.maxDate['second_proof'] = moment(
          this.formData['final_proof_date']
        ).subtract(1, 'days')['_d'];
        this.maxDate['final_proof'] = moment(
          this.formData['break_date']
        ).subtract(1, 'days')['_d'];
        this.minDate['end_date'] = moment(this.formData['break_date']).add(
          1,
          'days'
        )['_d'];
        // this.minDate['first_proof_date'] = moment(
        //   this.formData['first_proof_date']
        // ).add(0, 'days')['_d'];
        if (this.formData['third_proof_date']) {
          this.maxDate['third_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.minDate['live_dates'] = moment(
            this.formData['third_proof_date']
          ).add(1, 'days');
        } else if (this.formData['second_proof_date']) {
          this.maxDate['third_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.maxDate['second_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          if (!this.formData['third_proof_date']) {
            this.minDate['live_dates'] = moment(
              this.formData['second_proof_date']
            ).add(1, 'days');
          }
        } else if (this.formData['first_proof_date']) {
          this.maxDate['third_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.maxDate['second_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.maxDate['first_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          if (
            !this.formData['third_proof_date'] &&
            !this.formData['second_proof_date']
          ) {
            this.minDate['live_dates'] = moment(
              this.formData['first_proof_date']
            ).add(1, 'days');
          }
        } else {
          this.maxDate['third_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.maxDate['second_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
          this.maxDate['first_proof_date'] = moment(
            this.formData['live_dates'].startDate
          ).subtract(1, 'days')['_d'];
        }

        this.checkIsCurrDates();
        // console.log(this.minDate);
      });
    // this.fetchingData = false;
  }
  change(event) {
    // console.log(event);
    this.footerView = true;
  }
  checkIsCurrDates() {
    // this.minDate['live_dates'] = moment(new Date());

    // this.fetchingData = false;

    // return;
    // debugger;
    if (
      moment(this.minDate['first_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['first_proof_date'] = moment(new Date()).add(0, 'days')[
        '_d'
      ];
    }
    // else if(moment(this.minDate['first_proof_date']).diff(
    //   moment(new Date()),
    //   'days'
    // ) == 0){
    //   this.minDate['first_proof_date'] = moment(new Date()).add(1, 'days')[
    //     '_d'
    //   ];
    // }
    if (
      moment(this.minDate['second_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['second_proof_date'] = moment(new Date()).add(1, 'days')[
        '_d'
      ];
    }
    // else if(moment(this.minDate['second_proof_date']).diff(
    //   moment(new Date()),
    //   'days'
    // ) == 0){
    //   this.minDate['second_proof_date'] = moment(new Date()).add(1, 'days')[
    //     '_d'
    //   ];
    // }
    if (
      moment(this.minDate['third_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['third_proof_date'] = moment(new Date()).add(0, 'days')[
        '_d'
      ];
    }
    // else if(moment(this.minDate['third_proof_date']).diff(
    //   moment(new Date()),
    //   'days'
    // ) == 0){
    //   this.minDate['third_proof_date'] = moment(new Date()).add(1, 'days')[
    //     '_d'
    //   ];
    // }
    if (
      moment(this.minDate['first_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['first_proof_date'] = moment(new Date()).add(0, 'days')[
        '_d'
      ];
    }
    if (
      moment(this.minDate['live_dates']).diff(moment(new Date()), 'days') < 0
    ) {
      this.minDate['live_dates'] = moment(new Date());
      // this.minDate['live_dates'] =  moment(this.minDate['live_dates']).format('YYYY-MM-DD');
    } else if (
      moment(this.minDate['live_dates']).diff(moment(new Date()), 'days') == 0
    ) {
      let newDate = moment(new Date()).add(1, 'days')['_d'];
      this.minDate['live_dates'] = moment(newDate);
      // this.minDate['live_dates'] =  moment(
      //   this.minDate['live_dates']
      // ).format('MM/DD/YYYY');
    } else if (
      isNaN(moment(this.minDate['live_dates']).diff(moment(new Date()), 'days'))
    ) {
      this.minDate['live_dates'] = moment(new Date());
    }
    this.fetchingData = false;
  }
  getChannels() {
    this.adsService.getChannels({ status: [1] }).then(res => {
      this.channelTypes = res.result.data.data;
    });
  }
  allowNumber(event: any) {
    // const pattern = /^[0-9-]*$/;
    const pattern = /^-?[0-9]+(\.[0-9]*){0,1}$/g;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  getCampaings() {
    this.campaignService.getCampaigns({ status: [1] }).then(res => {
      this.campaignData = res.result.data.data;
      this.campaignData.unshift({
        end_date: '2018-10-27',
        id: '',
        marketing_goal: '',
        name: 'Select',
        start_date: '2018-09-18',
        status: 1
      });
    });
  }
  dateValueChange(field, event) {
    this.footerView = true;
    let levels = [];
    // for (let i = 0; i < 20; i++) {
    //   levels.push( this.createAdForm.value.adDetailsFormValues);
    // }
    // this.createAdForm.patchValue({
    //   adDetailsFormValues: levels
    // });

    let formArray = this.adDetailsForm.get('adDetailsFormValues') as FormArray;
    let valJson = {};
    formArray.value.map(attr => {
      Object.assign(valJson, attr);
    });
    if (field.db_column_key === 'first_proof_date') {
      this.minDate['second_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.disableStatus['second_proof_date'] = false;
      // if(!this.adDetailsForm.)
      formArray.controls.map(row => {
        if (row['controls'].second_proof_date) {
          if (row['controls'].second_proof_date.value) {
            return;
          } else {
            this.minDate['live_dates'] = moment(event.value).add(1, 'days');
            //   let data = {
            //     startDate: moment(event.value).add(1, 'days'),
            //     endDate: moment(event.value).add(15, 'days')
            //   };
            //   formArray.controls.map(row => {
            //     if (row['controls'].live_dates) {
            //       row.patchValue({ live_dates: data });
            //     }
            //   });
          }
        }
      });
    } else if (field.db_column_key === 'second_proof_date') {
      this.minDate['third_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.maxDate['first_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
      this.disableStatus['third_proof_date'] = false;
      formArray.controls.map(row => {
        if (row['controls'].third_proof_date) {
          if (row['controls'].third_proof_date.value) {
            return;
          } else {
            this.minDate['live_dates'] = moment(event.value).add(1, 'days');
            // let data = {
            //   startDate: moment(event.value).add(1, 'days'),
            //   endDate: moment(event.value).add(15, 'days')
            // };
            // formArray.controls.map(row => {
            //   if (row['controls'].live_dates) {
            //     row.patchValue({ live_dates: data });
            //   }
            // });
          }
        }
      });
    } else if (field.db_column_key === 'third_proof_date') {
      this.maxDate['second_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
      this.minDate['live_dates'] = moment(event.value).add(1, 'days');
      // let data = {
      //   startDate: moment(event.value).add(1, 'days'),
      //   endDate: moment(event.value).add(15, 'days')
      // };
      // formArray.controls.map(row => {
      //   if (row['controls'].live_dates) {
      //     row.patchValue({ live_dates: data });
      //   }
      // });
    } else if (field.db_column_key === 'live_dates') {
      if (valJson['third_proof_date']) {
        this.maxDate['third_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        return;
      } else if (valJson['second_proof_date']) {
        this.maxDate['second_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['third_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        return;
      } else if (valJson['first_proof_date']) {
        this.maxDate['first_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['third_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['second_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        return;
      } else {
        this.maxDate['third_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['second_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
        this.maxDate['first_proof_date'] = moment(event.startDate).subtract(
          1,
          'days'
        )['_d'];
      }
    }
    // if (field.name === 'start_date') {
    //   if (form.value['break_date'] == '') {
    //     this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    //   }
    //   this.minDate['first_proof'] = moment(event.value).add(1, 'days')['_d'];
    // } else if (field.name === 'end_date') {
    //   if (form.value['first_proof_date'] == '') {
    //     this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')[
    //       '_d'
    //     ];
    //   }
    //   if (form.value['second_proof_date'] == '') {
    //     this.maxDate['first_proof'] = moment(event.value).subtract(1, 'days')[
    //       '_d'
    //     ];
    //   }
    //   if (form.value['final_proof_date'] == '') {
    //     this.maxDate['second_proof'] = moment(event.value).subtract(1, 'days')[
    //       '_d'
    //     ];
    //   }
    //   if (form.value['break_date'] == '') {
    //     this.maxDate['final_proof'] = moment(event.value).subtract(1, 'days')[
    //       '_d'
    //     ];
    //   }
    //   this.maxDate['break_date'] = moment(event.value).subtract(1, 'days')[
    //     '_d'
    //   ];
    //   this.disableStatus['first_proof'] = false;
    // } else if (field.name === 'break_date') {
    //   // this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')['_d'];
    //   // this.minDate['first_proof'] = moment(event.value).add(1, 'days')['_d'];
    //   // this.minDate['second_proof'] = moment(event.value).add(1, 'days')['_d'];
    //   this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.maxDate['final_proof'] = moment(event.value).subtract(1, 'days')[
    //     '_d'
    //   ];
    //   // this.disableStatus['first_proof'] = false;
    //   this.disableStatus['second_proof'] = false;
    // } else if (field.name === 'first_proof_date') {
    //   this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')[
    //     '_d'
    //   ];
    //   // this.minDate['break_date'] = moment(event.value).subtract(1, 'days')[
    //   //   '_d'
    //   // ];
    //   this.minDate['second_proof'] = moment(event.value).add(1, 'days')['_d'];
    //   // this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.disableStatus['second_proof'] = false;
    // } else if (field.name === 'second_proof_date') {
    //   // this.minDate['break_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.maxDate['first_proof'] = moment(event.value).subtract(1, 'days')[
    //     '_d'
    //   ];
    //   this.minDate['final_proof'] = moment(event.value).add(1, 'days')['_d'];
    //   // this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.disableStatus['final_proof'] = false;
    // } else if (field.name === 'final_proof_date') {
    //   // this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.minDate['break_date'] = moment(event.value).add(1, 'days')['_d'];
    //   this.maxDate['second_proof'] = moment(event.value).subtract(1, 'days')[
    //     '_d'
    //   ];
    //   this.disableStatus['break_date'] = false;
    // }
  }
  updateRange(event) {
    // console.log(event);
    // console.log(this.adDetailsForm);
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  onUpdate(event) {
    this.marketsList = event;
  }
  cancel() {
    let formArray = this.adDetailsForm.get('adDetailsFormValues') as FormArray;
    const levels = [];

    // this.formData['start_date'] = moment(this.formData['start_date']).toISOString();
    this.formData['first_proof_date'] = this.formData['first_proof_date']
      ? moment(this.formData['first_proof_date']).toISOString()
      : '';
    if (this.formData['first_proof_date']) {
      this.disableStatus['second_proof_date'] = false;
    } else {
      this.disableStatus['second_proof_date'] = true;
      this.disableStatus['third_proof_date'] = true;
    }
    this.formData['second_proof_date'] = this.formData['second_proof_date']
      ? moment(this.formData['second_proof_date']).toISOString()
      : '';
    if (this.formData['second_proof_date']) {
      this.disableStatus['third_proof_date'] = false;
    } else {
      this.disableStatus['third_proof_date'] = true;
    }
    // this.formData['final_proof_date'] = moment(
    //   this.formData['final_proof_date']
    // );
    this.formData['third_proof_date'] = this.formData['third_proof_date']
      ? moment(this.formData['third_proof_date']).toISOString()
      : '';
    // this.formData['break_date'] = moment(this.formData['break_date']);
    // this.formData['end_date'] = moment(this.formData['end_date']);
    this.formData['live_dates'].startDate = moment(
      this.formData['live_dates'].startDate
    ).format('MM/DD/YYYY');
    this.formData['live_dates'].endDate = moment(
      this.formData['live_dates'].endDate
    ).format('MM/DD/YYYY');

    this.minDate['second_proof_date'] = moment(
      this.formData['first_proof_date']
    ).add(1, 'days')['_d'];
    this.minDate['third_proof_date'] = moment(
      this.formData['second_proof_date']
    ).add(1, 'days')['_d'];

    this.minDate['break_date'] = moment(this.formData['final_proof_date']).add(
      1,
      'days'
    )['_d'];
    this.minDate['first_proof'] = moment(this.formData['start_date']).add(
      1,
      'days'
    )['_d'];
    this.minDate['second_proof'] = moment(
      this.formData['first_proof_date']
    ).add(1, 'days')['_d'];
    this.minDate['final_proof'] = moment(
      this.formData['second_proof_date']
    ).add(1, 'days')['_d'];
    this.maxDate['start_date'] = moment(
      this.formData['first_proof_date']
    ).subtract(1, 'days')['_d'];
    this.maxDate['break_date'] = moment(this.formData['end_date']).subtract(
      1,
      'days'
    )['_d'];
    this.maxDate['first_proof_date'] = this.formData['second_proof_date']
      ? moment(this.formData['second_proof_date']).subtract(1, 'days')['_d']
      : '';
    this.maxDate['second_proof_date'] = this.formData['third_proof_date']
      ? moment(this.formData['third_proof_date']).subtract(1, 'days')['_d']
      : '';

    this.maxDate['first_proof'] = moment(
      this.formData['second_proof_date']
    ).subtract(1, 'days')['_d'];
    this.maxDate['second_proof'] = moment(
      this.formData['final_proof_date']
    ).subtract(1, 'days')['_d'];
    this.maxDate['final_proof'] = moment(this.formData['break_date']).subtract(
      1,
      'days'
    )['_d'];
    this.minDate['end_date'] = moment(this.formData['break_date']).add(
      1,
      'days'
    )['_d'];
    // this.minDate['first_proof_date'] = moment(
    //   this.formData['first_proof_date']
    // ).add(0, 'days')['_d'];
    if (this.formData['third_proof_date']) {
      this.maxDate['third_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.minDate['live_dates'] = moment(
        this.formData['third_proof_date']
      ).add(1, 'days');
    } else if (this.formData['second_proof_date']) {
      this.maxDate['third_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.maxDate['second_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      if (!this.formData['third_proof_date']) {
        this.minDate['live_dates'] = moment(
          this.formData['second_proof_date']
        ).add(1, 'days');
      }
    } else if (this.formData['first_proof_date']) {
      this.maxDate['third_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.maxDate['second_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.maxDate['first_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      if (
        !this.formData['third_proof_date'] &&
        !this.formData['second_proof_date']
      ) {
        this.minDate['live_dates'] = moment(
          this.formData['first_proof_date']
        ).add(1, 'days');
      }
    } else {
      this.maxDate['third_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.maxDate['second_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
      this.maxDate['first_proof_date'] = moment(
        this.formData['live_dates'].startDate
      ).subtract(1, 'days')['_d'];
    }

    this.checkIsCurrDates();
    // this.minDate['live_dates'] = moment(this.formData['live_dates'].startDate);
    for (let i = 0; i < 20; i++) {
      levels.push(this.formData);
    }

    this.adDetailsForm.patchValue({
      adDetailsFormValues: levels
    });
    let data = {
      startDate: moment(this.formData['live_dates'].startDate).format(
        'MM/DD/YYYY'
      ),
      endDate: moment(this.formData['live_dates'].endDate).format('MM/DD/YYYY')
    };
    setTimeout(() => {
      formArray.controls.map(row => {
        if (row['controls'].live_dates) {
          row.patchValue({ live_dates: data });
        }
      });
    }, 1000);

    this.footerView = false;
    this.errorMsg = '';
  }
  valChangedDrop(key) {
    this.footerView = true;
    let formArray = this.adDetailsForm.get('adDetailsFormValues') as FormArray;
    let valArray = formArray.value;
    if (key === 'channel_id') {
      formArray.controls.map(row => {
        if (row['controls'].channel_id) {
          this.appService
            .getDropdownOptions('getChannelTypes', {
              channel_id: row['controls'].channel_id.value,
              status: [1]
            })
            .then(res => {
              this.channelTypeIds = res.result.data.data;
            });
        }
      });
    }
  }
  valChanged() {
    this.footerView = true;
  }

  update(form) {
    // if (this.adsService.isImportProgess) {
    //   this.adsService.showImportProg();
    //   return;
    // }
    this.submitted = true;
    const dummyJson = {};
    form.value.adDetailsFormValues.map(attr => {
      Object.assign(dummyJson, attr);
    });
    console.log(form);
    if (
      dummyJson['vehicle'] &&
      dummyJson['week_no'] &&
      dummyJson['vehicle_type'] &&
      dummyJson['live_dates']
    ) {
      this.state.section.forEach(attr => {
        if (attr.key === 'date' && dummyJson[attr.db_column_key]) {
          dummyJson[attr.db_column_key] = moment(
            dummyJson[attr.db_column_key]
          ).format('YYYY-MM-DD');
        } else if (attr.key === 'date_range') {
          dummyJson[attr.db_column_key].startDate = moment(
            dummyJson[attr.db_column_key].startDate
          ).format('YYYY-MM-DD');
          dummyJson[attr.db_column_key].endDate = moment(
            dummyJson[attr.db_column_key].endDate
          ).format('YYYY-MM-DD');
        }
      });
      this.adsService
        .createAds(Object.assign({}, { id: this.appService.adId }, dummyJson))
        .then(res => {
          if (res.result.success) {
            this.appService.adDetails = res.result.data;
            this.formData = dummyJson;
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: ' Ad Details Updated Successfully!'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.errorMsg = '';
            this.footerView = false;
          } else {
            this.errorMsg = res.result.data;
          }
        });
    }
  }
  showPopup(param) {
    if (this.adsService.isImportProgess) {
      this.adsService.showImportProg();
      return;
    }
    let mode = param;
    const rowData = {
      delete_api:
        mode === 'exported'
          ? 'exportPage'
          : mode === 'versionexport'
          ? 'exportAdVersion'
          : 'deleteAds',
      label: 'Ad'
    };
    mode = mode === 'versionexport' ? 'exported' : mode;
    const dialogRef = this.dailog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: {
        rowData: rowData,
        selectedRow: { ad_id: this.appService.adId },
        mode: mode === 'exported' ? 'export' : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        if (result.data.status) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg:
                'Ad ' +
                (mode === 'exported' ? 'Exported' : 'Deleted') +
                ' Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          mode === 'exported'
            ? window.open(result.data.data, '_self')
            : this.router.navigateByUrl('/vehicles');
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: result.data.data
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      } else {
        if (result.from !== 'close') {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: 'Problem occured while Exporting'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      }
    });
  }
  adPreview() {
    this.dialogRef = this.dailog.open(AdPreviewComponent, {
      panelClass: 'editform-dialog',
      width: '600px',
      data: {
        ad_id: this.appService.adId,
        url: 'exportPreview',
        from: 'adDetails'
      }
    });
  }

  customAttributes() {
    this.dialogRef = this.dailog.open(CustomAttributesComponent, {
      panelClass: 'custom-attributes-dialog',
      width: '800px',
      data: {
        from: 'adDetails'
      }
    });
  }
}
