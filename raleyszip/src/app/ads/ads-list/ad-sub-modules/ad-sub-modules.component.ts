import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';
import { AdsService } from '../../ads.service';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
@Component({
  selector: 'app-ad-sub-modules',
  templateUrl: './ad-sub-modules.component.html',
  styleUrls: ['./ad-sub-modules.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('topAnimate', [
      transition(':enter', [
        style({ transform: 'translateY(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdSubModulesComponent implements OnInit {
  public subheadersList: any;
  public routeUrl: any;
  public rowData = [];
  public samplePath: any;
  public columnDefs = [];
  public gridApi: any;
  public gridColumnApi = [];
  public headersData = [];
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
  public dialogRef: any;
  public listData: any;
  public adDetails: any;
  dataLoad = true;
  // alive = true;
  constructor(
    private http: HttpClient,
    public appService: AppService,
    public adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    activeRoute.params.subscribe(param => {
      this.routeUrl = param.url;
      this.appService.adId = param.url ? param.url : '';
    });
    let i = 0;
    timer(0, 5000)
      .pipe(takeWhile(() => this.adsService.alive)) // only fires when component is alive
      .subscribe(() => {
        this.adsService.checkAdImportStatus(this.appService.adId).then(res => {
          console.log(new Date());
          i++;
          if (!res.result.data.isLockImport) {
            this.adsService.alive = false;
            this.adsService.isImportProgess = false;

            if (i > 1) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Items Data Imported Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            }
          } else {
            this.adsService.isImportProgess = true;
            if (res.result.data.action) {
              this.adsService.importProgStatus = res.result.data.message;
              this.adsService.importProgVal = res.result.data.action_progress;

              // if (res.result.data.action == 'pending') {
              //   this.adsService.importProgVal = 25;
              // } else if (res.result.data.action == 'processing') {
              //   this.adsService.importProgVal = 60;
              // } else {
              //   this.adsService.importProgVal = 15;
              // }
            }
            // this.adsService.showImportProg();
          }
        });
      });
  }
  public params = {
    search: '',
    pageSize: 20,
    id: '',
    pageNumber: 1
  };
  ngOnInit() {
    this.adsService.hideHeader = false;
    this.getList();
    this.adsService.isImportProgess = false;
    this.adsService.checkAdImportStatus(this.appService.adId).then(res => {
      if (!res.result.data.isLockImport) {
        this.adsService.alive = false;
        this.adsService.isImportProgess = false;
      } else {
        this.adsService.isImportProgess = true;
        if (res.result.data.action) {
          this.adsService.importProgStatus = res.result.data.message;
          // if (res.result.data.action == 'pending') {
          //   this.adsService.importProgVal = 25;
          // } else if (res.result.data.action == 'processing') {
          //   this.adsService.importProgVal = 60;
          // } else {
          this.adsService.importProgVal = res.result.data.action_progress;
          // }
        }
        // this.adsService.showImportProg();
      }
    });
  }

  getList() {
    const currentTabData = this.appService.getListData('Others', 'AD_DETAILS');
    this.subheadersList = this.appService.subHeaders;
    this.selectedList(currentTabData);
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + currentTabData.url
    );
  }

  selectedList(list) {
    this.params.id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        if (res.result.success) {
          this.appService.adDetails = res.result.data;
          this.appService.baseVersionDetails =
            res.result.data.base_version_info;
          this.adDetails = this.appService.adDetails;
          this.appService.adName = res.result.data.vehicle;
        }
      });
  }
}
