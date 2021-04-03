import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditModComponent } from '@app/dialogs/edit-mod/edit-mod.component';
import { AppService } from '@app/app.service';
import { AdsService } from '@app/ads/ads.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

const APP: any = window['APP'];

@Component({
  selector: 'app-ad-pages',
  templateUrl: './ad-pages.component.html',
  styleUrls: ['./ad-pages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdPagesComponent implements OnInit {
  public dialogRef: any;
  public currentTabData: any;
  public editModInputData: any;
  public pagesInfo = [];
  public pageDetails = [];
  public editingMod = false;
  public selectedPage = '';
  public fetchingData = true;
  public modStaus = [{ id: 1, name: 'Pending' }, { id: 2, name: 'Completed' }];
  public image_url = APP.img_url + 'no-mod-image.png';
  public expandListValue = false;
  public selectedModId;
  public expandTrigger = false;

  /////

  public pageId;
  public newModOrder;
  public pageDetailsBlank = [];
  public createMOdError = '';
  public modValue = false;
  public pageDetailsBlankArray = [];
  public blankModIndex;

  constructor(
    public dialog: MatDialog,
    private appService: AppService,
    public adsService: AdsService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
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
  getList() {
    this.currentTabData = this.appService.getListData('Others', 'PAGES');
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    );

    const adDetail = this.appService.getListData('Others', 'AD_DETAILS');
    let adParam = {
      id: this.appService.adId
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
          this.fetchingData = false;
        }
      });
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
    this.pageDetails = [];
    this.fetchingData = true;
    this.adsService.hideHeader = false;
    this.editingMod = false;
    let params = {
      ad_id: this.appService.adId,
      id: this.selectedPage
    };
    this.adsService.getAdModules([{ url: list.get_api }, params]).then(res => {
      // if(this.pageDetails.length){
      //   this.pageDetails = this.pageDetails.concat(res.result.data);
      // }
      // else{
      this.pageDetails = [];
      this.pageDetails.push(res.result.data);
      this.fetchingData = false;
      let obj = {
        isExp: 0
      };
      this.pageDetails[0].mod_details.map((mod, index) => {
        this.pageDetails[0].mod_details[index] = { ...mod, ...obj };
      });
      // }

      this.pageId = res.result.data.page_id;
    });
  }
  editModDialog(detail, mod) {
    this.adsService.hideHeader = true;
    this.editingMod = true;
    this.editModInputData = {
      modData: detail,
      currMod: mod,
      pagesInfo: this.pagesInfo,
      selectedPage: this.selectedPage
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

  createBlankMod(from) {
    console.log(this.pageId);
    this.createMOdError = '';

    let params = {
      // id: '',
      page_id: this.pageId,
      ad_id: this.appService.adId,
      mod_order: this.newModOrder
    };

    this.adsService
      .getAdModules([{ url: 'createNewMod' }, params])
      .then(res => {
        // console.log(res)

        if (res.result.success) {
          let modData = res.result.data;

          let list = {
            get_api: 'getPageInfo'
          };
          // this.selectedList(list);
          let params = {
            ad_id: this.appService.adId,
            id: this.selectedPage
          };
          this.adsService
            .getAdModules([{ url: list.get_api }, params])
            .then(res => {
              //  console.log(res)
              if (res.result.success) {
                this.pageDetailsBlank = res.result.data.mod_details;

                this.pageDetailsBlankArray = res.result.data;

                // console.log(this.pageDetailsBlank)
                this.modValue = false;

                // let index = this.pageDetailsBlank.length - 1;
                this.pageDetailsBlank.forEach((obj, index) => {
                  if (obj.mod_order == this.newModOrder) {
                    this.blankModIndex = index;
                  }
                });
                // let index = parseInt(this.newModOrder) - 1;
                // console.log(index)

                this.editModDialog(
                  this.pageDetailsBlankArray,
                  this.pageDetailsBlank[this.blankModIndex]
                );
              }
            });
        } else {
          this.createMOdError = res.result.data;
        }
      });
  }

  modView(value) {
    this.createMOdError = '';
    this.newModOrder = '';
    if (value == 'open') {
      this.modValue = true;
    } else {
      this.modValue = false;
    }
  }
}
