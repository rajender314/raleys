import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { timeout } from 'q';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-split-mod',
  templateUrl: './split-mod.component.html',
  styleUrls: ['./split-mod.component.scss']
})
export class SplitModComponent implements OnInit {
  public process: boolean = false;
  public btnDisable: boolean = false;
  public pagesInfo = [];
  public pageDetails: any;
  public selectedPage = '';
  public selectedMod = '';
  public newModOrder = '';
  public createMOdError = '';
  public spinner = false;
  public modValue = false;
  @ViewChild('modPills') private pillsContainer: ElementRef;
  constructor(
    private dialogRef: MatDialogRef<SplitModComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private settingsService: SettingsService,
    private adsService: AdsService,
    private appService: AppService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.pagesInfo = this.data.pagesInfo;
    this.selectedPage = this.data.rowData.page_id;
    this.selectedMod = this.data.rowData.mod_id;
    this.pageDetails = this.data.currentPageDetails;
    // this.onPageSelected(this.selectedPage, '');
  }

  onPageSelected(event, action) {
    this.spinner = true;
    this.selectedPage = event;
    let params = {
      ad_id: this.appService.adId,
      id: this.selectedPage
    };
    this.adsService.getAdModules([{ url: 'getPageInfo' }, params]).then(res => {
      this.pageDetails = {};
      this.pageDetails = res.result.data;
      let idx = _.findIndex(this.pageDetails['mod_details'], {
        mod_id: this.data.rowData.mod_id
      });
      idx = idx > -1 ? idx : 0;
      if (action != 'newMod') {
        this.selectedMod = this.pageDetails['mod_details'].length
          ? this.pageDetails['mod_details'][idx].mod_id
          : '';
      }
    });
    this.spinner = false;
  }

  closeDialog = () => {
    this.dialogRef.close({ from: 'close' });
  };

  change(event) {
    this.selectedMod = event;
  }
  splitingMod() {
    this.process = true;
    if (this.data.mode === 'split-mod') {
      let prms = {
        mod_id: this.selectedMod,
        page_id: this.selectedPage,
        promotions: this.data.rowData.promotions,
        current_page_id: this.data.rowData.page_id,
        current_mod_id: this.data.rowData.mod_id,
        ad_id: this.appService.adId
      };
      this.adsService
        .getAdModules([{ url: 'saveSplitMod' }, prms])
        .then(res => {
          if (res.result.success) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Mod split successfully.'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            setTimeout(() => {
              this.dialogRef.close({ from: 'split-mod', result: res });
              this.process = false;
            }, 500);
          } else {
            this.process = false;
          }
        });
    }
  }
  addMod() {
    this.createMOdError = '';
    let params = {
      ad_id: this.appService.adId,
      page_id: this.selectedPage,
      mod_order: this.newModOrder,
      mod_dept_group: this.data.activeMod.mod_dept_group
    };
    this.adsService
      .getAdModules([{ url: 'createNewMod' }, params])
      .then(res => {
        // console.log(res);
        if (res.result.success) {
          this.newModOrder = '';
          this.modView('');
          this.onPageSelected(this.selectedPage, 'newMod');
          setTimeout(() => {
            this.pillsContainer.nativeElement.scrollTop = this.pillsContainer.nativeElement.scrollHeight;
            this.change(res.result.data._id);
          }, 200);
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
