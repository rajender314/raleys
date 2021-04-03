import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditModComponent } from '@app/dialogs/edit-mod/edit-mod.component';
import { AppService } from '@app/app.service';
import { AdsService } from '@app/ads/ads.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { CreateSignageComponent } from '@app/dialogs/create-signage/create-signage.component';
import { CreateEmptySignageComponent } from '@app/dialogs/create-empty-signage/create-empty-signage.component';

const APP: any = window['APP'];
@Component({
  selector: 'app-ad-signage',
  templateUrl: './ad-signage.component.html',
  styleUrls: ['../ad-pages/ad-pages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdSignageComponent implements OnInit {
  public dialogRef: any;
  public currentTabData: any;
  public editModInputData: any;
  public pagesInfo = [];
  public pageDetails = [];
  public deptList = [];
  public editingMod = false;
  public selectedPage = '';
  public fetchingData = true;
  public modStaus = [{ id: 1, name: 'Pending' }, { id: 2, name: 'Completed' }];
  public image_url = APP.img_url + 'no-mod-image.png';
  public expandListValue = false;
  public selectedModId;
  public dept_filterKey = '';
  public selectedDepartment = 'ALL';
  public expandTrigger = false;
  public headerCreativeArray = [];
  constructor(
    public dialog: MatDialog,
    private appService: AppService,
    public adsService: AdsService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getSignHeaders();
    this.expandListValue = false;
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

    this.fetchingData = true;
    this.getList();
  }
  getSignHeaders() {
    this.adsService
      .getVehicles([{ url: 'getSignHeaders' }, { status: [1] }])
      .then(res => {
        if (res.result.success) {
          this.headerCreativeArray = res.result.data.data;
        }
      });
  }
  getList() {
    this.currentTabData = this.appService.getListData('Others', 'SIGNAGE');
    // this.router.navigateByUrl(
    //   'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    // );
    const adDetail = this.appService.getListData('Others', 'AD_DETAILS');
    let adParam = {
      id: this.appService.adId,
      dept_group_filter: this.dept_filterKey ? this.dept_filterKey : undefined
    };
    this.adsService
      .getAdModules([{ url: adDetail.get_api }, adParam])
      .then(res => {
        this.pagesInfo = res.result.data.pages_details;
        this.appService.pagesInfo = res.result.data.pages_details;
        if (this.pagesInfo.length) {
          this.selectedPage = this.pagesInfo[0].id;
          this.selectedList(this.currentTabData);
        } else {
          this.pageDetails = [];
          this.selectedList(this.currentTabData);
          // this.fetchingData = false;
        }
      });
    this.getDepartmnetsList();
    // this.pagesInfo = this.appService.pagesInfo;

    // this.selectedList(this.currentTabData);
  }
  onModStatusChanged(event, mod) {
    let i = _.findIndex(this.pageDetails[0].mod_details, {
      mod_id: mod.mod_id
    });
    // debugger;
    // if(i > -1){
    //   if(this.pageDetails[0].mod_details[i].status == event){
    //     return;
    //   }
    // }
    let params = {
      mod_id: mod.mod_id,
      status: event
    };
    this.adsService
      .getAdModules([{ url: 'updateModStatus' }, params])
      .then(res => {
        if (res.result.success) {
          if (i > -1) {
            this.pageDetails[0].mod_details[i].status = event;
          }
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Mod Status Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
  }
  onPageSelected(event) {
    this.selectedPage = event;
    this.fetchingData = true;
    this.selectedList(this.currentTabData);
  }
  selectedList(list) {
    this.adsService.hideHeader = false;
    this.editingMod = false;
    let params = {
      ad_id: this.appService.adId,
      dept_group_filter: this.dept_filterKey ? this.dept_filterKey : undefined
    };
    this.adsService.getAdModules([{ url: list.get_api }, params]).then(res => {
      // if(this.pageDetails.length){
      //   this.pageDetails = this.pageDetails.concat(res.result.data);
      // }
      // else{
      this.pageDetails = [];
      this.pageDetails = res.result.data;

      this.fetchingData = false;
      // let obj = {
      //   isExp: 0
      // };
      // this.pageDetails[0].mod_details.map((mod, index) => {
      //   this.pageDetails[0].mod_details[index] = { ...mod, ...obj };
      // });
      // }
    });
  }
  exportSignage() {
    const rowData = {
      delete_api: 'exportSignage',
      label: 'Signage'
    };
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: {
        rowData: rowData,
        selectedRow: { ad_id: this.appService.adId },
        mode: 'export'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        if (result.data.status) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Signage Exported Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          window.open(result.data.data, '_self');
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

    // this.adsService.sendOuput('exportSignage', { 'ad_id': this.appService.adId }).then(res => {
    //   console.log(res);
    // })
  }
  editSignageDialog(detail, index) {
    //  console.log(index);
    this.adsService.hideHeader = true;
    this.editingMod = true;
    this.editModInputData = {
      // modData: detail,
      // currMod: mod,
      // pagesInfo: this.pagesInfo,
      // selectedPage: this.selectedPage
      selctedSignage: detail,
      totalSignages: this.pageDetails,
      headerCreativeArray: this.headerCreativeArray,
      index: index
    };
    // this.dialogRef = this.dialog.open(EditModComponent, {
    //   panelClass: ['editmod-dialog'],
    //   width: '600px',
    //   data: { modData: detail, currMod: mod }
    // });

    // this.dialogRef.afterClosed().subscribe(res => {
    //   // if (res && res.data.result.success) {
    //   this.selectedList(this.currentTabData);
    //   // this.savedViewValue = res.data.result.data._id;
    //   // this.getSavedViews();
    //   // }
    // });
  }
  expandList(mod) {
    // this.expandTrigger = true;
    // this.selectedModId = mod.mod_id;
    // console.log(this.selectedModId);
    // this.expandListValue = !this.expandListValue;
    let i = _.findIndex(this.pageDetails[0].mod_details, {
      mod_id: mod.mod_id
    });
    if (i > -1) {
      this.pageDetails[0].mod_details[i].isExp = !this.pageDetails[0]
        .mod_details[i].isExp;
    }
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
    const index = _.findIndex(this.deptList, { id: event });
    if (index > -1) {
      if (event != 'ALL') {
        this.dept_filterKey =
          this.deptList[index].dept_code +
          ':' +
          ' ' +
          this.deptList[index].name;
      } else {
        this.dept_filterKey = '';
      }
    } else {
      this.dept_filterKey = '';
    }
    this.getList();
  }

  createSign(from) {
    this.dialogRef = this.dialog.open(CreateSignageComponent, {
      panelClass: ['overlay-dialog'],
      width: '850px',
      data: {
        title: 'Create Signage',
        deptList: this.deptList,
        selectedDepartment: this.selectedDepartment,
        from: from,
        totalSignages: this.pageDetails
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getList();
      }
      // if (result) {
      //   this.snackbar.openFromComponent(SnackbarComponent, {
      //     data: {
      //       status: 'success',
      //       msg: ' Signage Created Successfully'
      //     },
      //     verticalPosition: 'top',
      //     horizontalPosition: 'right'
      //   });
      // }
    });
  }

  createBlankSign(from) {
    this.dialogRef = this.dialog.open(CreateEmptySignageComponent, {
      panelClass: ['overlay-dialog'],
      width: '850px',
      data: {
        title: 'Create Empty Signage',
        deptList: this.deptList,
        pagedetails: this.pageDetails,
        from: from,
        ad_id: this.appService.adId,
        flag: 'new'
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      // console.log(result)

      if (result) {
        let params = {
          ad_id: this.appService.adId
        };
        this.adsService
          .getAdModules([{ url: 'getSignage' }, params])
          .then(res => {
            if (res.result.success) {
              this.pageDetails = [];
              this.pageDetails = res.result.data;

              this.fetchingData = false;
              this.editSignageDialog2(result, this.pageDetails);
            }
          });
      }
    });

    // let newsignParam = {
    //   ad_id: this.appService.adId,
    //   flag: 'new'
    // }

    // this.adsService
    // .getAdModules([{ url: 'createSignage' }, newsignParam])
    // .then(res => {

    //   console.log(res.result.data.data);
    //   let blankSign = res.result.data.data;

    //   this.editSignageDialog(blankSign);

    // })
  }

  editSignageDialog2(detail, signlist) {
    // console.log(detail);
    this.adsService.hideHeader = true;
    this.editingMod = true;
    this.editModInputData = {
      // modData: detail,
      // currMod: mod,
      // pagesInfo: this.pagesInfo,
      // selectedPage: this.selectedPage
      deptId: detail.deptId,
      selctedSignage: detail.blankSign,
      totalSignages: signlist,
      headerCreativeArray: this.headerCreativeArray,
      from: 'emptySign',
      index: 0
    };
    // this.dialogRef = this.dialog.open(EditModComponent, {
    //   panelClass: ['editmod-dialog'],
    //   width: '600px',
    //   data: { modData: detail, currMod: mod }
    // });

    // this.dialogRef.afterClosed().subscribe(res => {
    //   // if (res && res.data.result.success) {
    //   this.selectedList(this.currentTabData);
    //   // this.savedViewValue = res.data.result.data._id;
    //   // this.getSavedViews();
    //   // }
    // });
  }
}
