import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDatepicker
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { Router } from '@angular/router';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { UsersService } from '@app/users/users.service';
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
import { CustomValidation } from '../../shared/utility/custom-validations';
const APP: any = window['APP'];

export interface User {
  name: string;
}
@Component({
  selector: 'app-create-ad',
  templateUrl: './create-ad.component.html',
  styleUrls: ['./create-ad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateAdComponent implements OnInit {
  public state = {
    section: []
  };
  public campaignData = [];
  public channelTypes = [];
  public divisionsList = [];
  public selectedDiv = [];
  public allDivIds = [];
  public errorMsg = '';
  public creatingAd = false;
  public disableChannelType = true;
  ranges01: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  };
  public submitted: boolean;
  public formReady = false;
  public minDate = {
    start_date: new Date(),
    end_date: moment(new Date()).add(1, 'days')['_d'],
    break_date: moment(new Date()).add(1, 'days')['_d'],
    first_proof: moment(new Date()).add(1, 'days')['_d'],
    second_proof: moment(new Date()).add(1, 'days')['_d'],
    final_proof: moment(new Date()).add(1, 'days')['_d'],
    first_proof_date: moment(new Date()).add(0, 'days')['_d'],
    second_proof_date: moment(new Date()).add(1, 'days')['_d'],
    third_proof_date: moment(new Date()).add(1, 'days')['_d'],
    live_dates: moment(new Date())
  };
  public maxDate = {
    start_date: '',
    end_date: '',
    break_date: '',
    first_proof: '',
    second_proof: '',
    final_proof: '',
    first_proof_date: '',
    second_proof_date: '',
    third_proof_date: '',
    live_dates: new Date()
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
  public displayLoader = false;
  public chkSelectedCampaign = [];
  public loadingMsg = 'Creating Ad, please wait...';
  public creatingAdloader = true;
  public channelTypeIds = [];
  filteredOptions: Observable<User[]>;
  options = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  createAdForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<CreateAdComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private adsService: AdsService,
    private appService: AppService,
    private router: Router,
    private campaignService: CampaignsService,
    private userService: UsersService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }
  ngOnInit() {
    this.displayLoader = false;
    this.formReady = false;
    const formData = this.appService.getListData('Top-Headers', 'ADS');
    this.appService.getFormDeatils(formData._id).then(res => {
      this.state.section = res.result.data.specsInfo;
      this.createForm();
    });
    // this.getDivisions();
    // this.getChannels();
    // this.getCampaings();
    this.rangeOptions = {
      presets: this.presets,
      format: 'mediumDate',
      range: { fromDate: new Date(), toDate: new Date() },
      applyLabel: 'Submit',
      placeholder: ''
    };
  }

  displayFn(user?: User): string | undefined {
    const i = _.findIndex(<any>this.chkSelectedCampaign, { id: user });
    return i > -1 ? this.chkSelectedCampaign[i].name : undefined;
  }
  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.campaignData.filter(
      option => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  createForm(): void {
    this.createAdForm = this.fb.group({
      adDetailsFormValues: this.fb.array([])
    });
    this.createControls();
  }

  public get adDetailsFormValues() {
    return this.createAdForm.get('adDetailsFormValues') as FormArray;
  }
  createControls() {
    let i = 0;
    this.state.section.forEach(attr => {
      this.adDetailsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    this.formReady = true;
  }
  createFormGroup(attr, idx) {
    if (attr.key === 'dropdown' || attr.key === 'multiple_choice') {
      if (attr.get_api) {
        this.appService
          .getDropdownOptions(attr.get_api, { status: [1] })
          .then(res => {
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
                moment(new Date()).week(),
                Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(53),
                  Validators.pattern('^[0-9]*$')
                ])
              ]
            : moment(new Date()).week()
        });
      } else if (attr.key === 'date_range') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ''
        });
      } else {
        if (attr.key === 'single_line_text') {
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
      }
    } else {
      return this.fb.group({
        [attr.db_column_key]: ''
      });
    }
  }
  updateRange(event) {}
  dateValueChange(field, event) {
    let levels = [];
    // for (let i = 0; i < 20; i++) {
    //   levels.push( this.createAdForm.value.adDetailsFormValues);
    // }
    // this.createAdForm.patchValue({
    //   adDetailsFormValues: levels
    // });
    const formArray = this.createAdForm.get('adDetailsFormValues') as FormArray;
    let valJson = {};
    formArray.value.map(attr => {
      Object.assign(valJson, attr);
    });
    if (field.db_column_key === 'first_proof_date') {
      this.minDate['second_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.disableStatus['second_proof_date'] = false;
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
    } else if (field.db_column_key === 'second_proof_date') {
      this.minDate['third_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.maxDate['first_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
      this.disableStatus['third_proof_date'] = false;
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
  allowNumber(event: any) {
    // const pattern = /^[0-9-]*$/;
    const pattern = /^-?[0-9]+(\.[0-9]*){0,1}$/g;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  valChanged(key, event) {
    const formArray = this.createAdForm.get('adDetailsFormValues') as FormArray;
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
              this.disableChannelType = false;
            });
        }
      });
    }
  }
  setRange(data) {}
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  createAdd(form) {
    const dummyJson = {};
    this.errorMsg = '';
    form.value.adDetailsFormValues.map(attr => {
      Object.assign(dummyJson, attr);
    });
    if (form.valid) {
      this.creatingAd = true;
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
        .createAds(
          Object.assign(
            {},
            {
              id: ''
            },
            dummyJson
          )
        )
        .then(res => {
          if (res.result.success) {
            this.loadingMsg = 'Creating Ad, please wait...';
            this.appService.adId = res.result.data.id;
            this.appService.adName = res.result.data.vehicle;
            setTimeout(() => {
              this.loadingMsg = 'Ad Created Successfully';
              this.creatingAdloader = false;
            }, 1500);
            setTimeout(() => {
              this.creatingAd = false;
              this.dialogRef.close({
                data: res
              });
              this.router.navigateByUrl(
                'vehicles/' + this.appService.adId + '/ad-details'
              );
            }, 2000);
          } else {
            this.creatingAd = false;
            this.errorMsg = res.result.data;
          }
        });
    } else {
      this.submitted = true;
    }
  }
  getChannels() {
    this.adsService
      .getChannels({
        status: [1]
      })
      .then(res => {
        this.channelTypes = res.result.data.data;
      });
  }

  getDivisions() {
    let app = JSON.parse(APP['loginDetails']);
    const userData = app.user_data;
    this.userService
      .getDivisions({ user_id: userData.id, status: 1 })
      .then(res => {
        // let selArr = [{ id: 1, divname: 'Select All' }];
        this.divisionsList = res.result.data.data;
        // this.divisionsList.push();

        this.divisionsList.map(div => {
          this.allDivIds.push(div.id);
          if (div.checked) {
            this.selectedDiv.push(div.id);
          }
        });
        if (this.divisionsList.length) {
          // this.divisionsList = selArr.concat(this.divisionsList);
        }
        this.createAdForm.patchValue({
          divisions: this.selectedDiv
        });
      });
  }
  getCampaings() {
    this.campaignService
      .getCampaigns({
        status: [1]
      })
      .then(res => {
        this.campaignData = res.result.data.data;
        this.campaignData.unshift({
          end_date: '2018-10-27',
          id: '',
          marketing_goal: '',
          name: 'Select',
          start_date: '2018-09-18',
          status: 1
        });
        this.chkSelectedCampaign = res.result.data.data;
      });
    this.filteredOptions = this.createAdForm
      .get('campaign_id')
      .valueChanges.pipe(
        startWith<string | User>(''),
        map(value => (typeof value === 'string' ? value : value.name)),
        map(name => (name ? this._filter(name) : this.campaignData.slice()))
      );
  }
  divChanged(event) {
    // console.log(event);
  }

  close = () => {
    this.dialogRef.close();
  };
}
