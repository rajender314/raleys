import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { FormGroup, FormBuilder } from '@angular/forms';

const APP: any = window['APP'];
@Component({
  selector: 'app-create-empty-signage',
  templateUrl: './create-empty-signage.component.html',
  styleUrls: ['./create-empty-signage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEmptySignageComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreateEmptySignageComponent>,
    private adsService: AdsService,
    private appService: AppService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  public deptList = [];
  public selectedDepartment = [];
  public selectedUpcs = [];
  public rowData = [];
  public allAutoSizeColumns = [];
  public noData = false;
  public dataLoad = true;
  public rowSelection = 'multiple';
  public currentUrl = '';
  public search = {
    placeHolder: 'Search...',
    value: ''
  };
  public columnDefs = [];
  public boltIcon = APP.img_url + 'bolticon.svg';
  public gridApi: any;
  public gridColumnApi: any;
  public gridVisibility = false;
  public pointerEvents = false;
  public disableBtn = true;
  public fromComp = '';
  public loadingMsg = 'Loading Please Wait...';
  public impId = '';
  public btnText = 'Create Signage';
  public subscription: any;
  public searchparams = {
    search: this.selectedUpcs,
    pageNumber: 1,
    pageSize: 30,
    dept_group: [],
    upcs: [],
    ad_id: this.appService.adId,
    state: this.data.from,
    import_ad_id: this.fromComp != 'upc-search' ? this.impId : '',
    flag: this.fromComp != 'sign-search' ? 'promotions' : 'signages'
  };
  public updateProg = true;

  ////////

  createAdForm: FormGroup;
  public enableSubBtn = false;
  public dept_filterKey = '';
  public blankSign;
  public deptId;
  public qty_3x8;
  public qty_5x3_5;
  public qty_7x11;

  ngOnInit() {
    this.fromComp = this.data.from;
    this.deptList = this.data.deptList.slice(1);

    this.createForm();
  }

  createForm(): void {
    this.createAdForm = this.fb.group({
      dept_name: [''],
      qty_7x11: [''],
      qty_3x8: [''],
      qty_5x3_5: ['']
    });
  }

  createBlankSignage(form) {
    // console.log(form.value);

    let newsignParam = {
      dept_group: this.dept_filterKey,
      qty_3x8: this.qty_3x8,
      qty_5x3_5: this.qty_5x3_5,
      qty_7x11: this.qty_7x11,
      ad_id: this.appService.adId,
      flag: 'new'
    };

    this.adsService
      .getAdModules([{ url: 'createSignage' }, newsignParam])
      .then(res => {
        //  console.log(res.result.data.data);

        let modalResp = {};
        if (res.result.success) {
          this.blankSign = res.result.data.data;

          modalResp = {
            blankSign: this.blankSign,
            pageData: this.data.pagedetails,
            deptId: this.deptId
          };

          this.dialogRef.close(modalResp);
        }
      });
  }

  changeDept(event) {
    this.deptId = event;
    const index = _.findIndex(this.deptList, { id: event });

    if (index > -1) {
      this.dept_filterKey =
        this.deptList[index].dept_code + ':' + ' ' + this.deptList[index].name;
    }

    this.enableSubBtn = true;
  }

  // getPromotionsByDept(event) {
  //   const index = _.findIndex(this.deptList, { id: event });
  //   if (index > -1) {
  //     if (event != 'ALL') {
  //       this.dept_filterKey =
  //         this.deptList[index].dept_code +
  //         ':' +
  //         ' ' +
  //         this.deptList[index].name;
  //     } else {
  //       this.dept_filterKey = '';
  //     }
  //   } else {
  //     this.dept_filterKey = '';
  //   }
  //   this.getList();
  // }

  close = () => {
    this.dialogRef.close();
  };

  valChangedQty(event, qty) {
    event.target.value = event.target.value.replace(/[^0-9]*/g, '');
    // console.log(qty)

    if (qty == 'qty_3x8') {
      this.qty_3x8 = event.target.value;
    }
    if (qty == 'qty_5x3_5') {
      this.qty_5x3_5 = event.target.value;
    }
    if (qty == 'qty_7x11') {
      this.qty_7x11 = event.target.value;
    }
  }
}
