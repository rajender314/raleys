import { Component, OnInit } from '@angular/core';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { AdPreviewComponent } from '@app/dialogs/ad-preview/ad-preview.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
const APP: any = window['APP'];

@Component({
  selector: 'app-ad-reports',
  templateUrl: './ad-reports.component.html',
  styleUrls: ['./ad-reports.component.scss']
})
export class AdReportsComponent implements OnInit {
  public currentTabData: any;
  public adName: any;
  public listData: any;
  public adReports = [];
  public dialogRef: any;
  public noData = false;
  public noReports = APP.img_url + 'Stores.svg';
  public deleteLogo = APP.img_url + 'delete_add.png';

  // public downloadBtn = 'Download';
  dataLoad = true;

  public params = {
    search: '',
    pageSize: '',
    ad_id: '',
    pageNumber: ''
  };

  constructor(
    public adsService: AdsService,
    public appService: AppService,
    private dialog: MatDialog,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.adsService.hideHeader = false;
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
    this.getList();
  }

  getList() {
    this.currentTabData = this.appService.getListData('Others', 'REPORTS');
    this.selectedList(this.currentTabData);
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    );
    this.adName = this.appService.adName;
  }

  selectedList(list) {
    this.params.ad_id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        this.listData = list;
        this.dataLoad = false;
        this.adReports = res.result.data.data;
        for (let i = 0; i < this.adReports.length; i++) {
          this.adReports[i] = Object.assign({}, this.adReports[i], {
            downloadBtn: 'Download'
          });
        }
        if (this.adReports ? this.adReports.length : false) {
          this.noData = false;
        } else {
          this.noData = true;
        }
      });
  }

  adPreview(adReport) {
    this.dialogRef = this.dialog.open(AdPreviewComponent, {
      panelClass: 'editform-dialog',
      width: '600px',
      data: {
        ad_id: this.appService.adId,
        url: 'exportPreview',
        from: 'adReports',
        gridinfo: adReport
      }
    });
    this.dialogRef.afterClosed().subscribe(res => {
      // console.log(' ad preview closed ...');
      // this.getList();
    });
  }

  addReports() {
    //  console.log('add reports called ....');
    this.dialogRef = this.dialog.open(AdPreviewComponent, {
      panelClass: 'editform-dialog',
      width: '600px',
      data: {
        ad_id: this.appService.adId,
        url: 'exportPreview',
        from: 'adDetails'
      }
    });
    this.dialogRef.afterClosed().subscribe(res => {
      this.getList();
    });
  }

  adDownload(ad) {
    if (ad.downloadBtn === 'Downloading') {
      return;
    }
    let obj = {
      ad_id: ad.ad_id,
      report_id: ad.id
    };
    const index = _.findIndex(this.adReports, { id: ad.id });
    if (index > -1) {
      this.adReports[index].downloadBtn = 'Downloading';
    }
    this.adsService.exportAd(obj).then(res => {
      if (res && res.result.success && res.result.data.status) {
        window.location = res.result.data.data;
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: this.adReports[index].name + ' Downloaded Successfully!'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: this.adReports[index].name + ' Downloading Failed'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      if (index > -1) {
        this.adReports[index].downloadBtn = 'Download';
      }
    });

    // this.downloadBtn = 'Downloading'
    // const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
    //   panelClass: 'confirm-delete',
    //   width: '500px',
    //   data: {
    //     rowData: { label: 'Ad Report' },
    //     mode: 'download',
    //     exportObj: obj
    //   }
    // });

    // dialogRef.afterClosed().subscribe(res => {
    //   if (res.from === 'close1') {
    //     // if it is from ad preview (or) ad report page...
    //     if (res && res.result.result.success && res.result.result.data.status){
    //       window.location = res.result.result.data.data;
    //     }
    //   }
    // });
  }
  delRep(rep) {
    let dummyObj = {
      label: rep.name,
      delete_api: 'deleteReport'
    };
    let obj = Object.assign(this.listData, dummyObj);

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      // disableClose: true,
      data: { rowData: obj, selectedRow: { id: rep.id } }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getList();
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: rep.name + ' Deleted Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      } else {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: rep.name + ' Deleting Failed!'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }
}
