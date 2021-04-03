import { Component, OnInit } from '@angular/core';
import { CompService } from '../comp.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material';
import { AppService } from '@app/app.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comparision',
  templateUrl: './comparision.component.html',
  styleUrls: ['./comparision.component.scss']
})
export class ComparisionComponent implements OnInit {
  public impData = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-file'
  };
  public impData1 = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-files',
    id: 'edit-org-logo'
  };
  public impData2 = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-files',
    id: 'edit-org-logo1'
  };
  public importBtn = 'Import';
  public uploadDone = false;
  public impSucces = false;
  public impSucces1 = false;
  public checkUploadData: any;
  public proof1UploadData: any;
  public proof1UpldDone = false;
  public proof2UploadData: any;
  public proof2UpldDone = false;
  public checkError = '';
  public proof1ImpScs = false;
  public proof2ImpScs = false;
  public prog1 = false;
  public prog2 = false;
  public loader = true;
  public CompExptBtn = 'Compare and Export';
  constructor(
    public compService: CompService,
    private snackbar: MatSnackBar,
    public appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'COMPARE'
      });
      if (i < 0) {
        this.router.navigateByUrl('access-denied');
      }
    }
    setTimeout(() => {
      this.loader = false;
    }, 500);
  }
  importSuccess(event) {}
  importStarts(ev) {}
  fileUploadDone(ev) {
    this.uploadDone = true;
    this.checkUploadData = ev.data;
  }
  fileUploadStart(ev) {
    this.uploadDone = false;
    this.importBtn = 'Import';
  }
  proof1UploadDone(ev) {
    this.proof1UpldDone = true;
    this.proof1UploadData = ev.data;
  }
  proof1UploadStart(ev) {
    this.proof1UpldDone = false;
    this.impSucces = false;
    this.proof1ImpScs = false;
    this.prog1 = false;
  }
  proof2UploadDone(ev) {
    this.proof2UpldDone = true;
    this.proof2UploadData = ev.data;
  }
  proof2UploadStart(ev) {
    this.proof2UpldDone = false;
    this.impSucces1 = false;
    this.proof2ImpScs = false;
    this.prog2 = false;
  }
  tabChange(ev) {}
  importData() {
    if (
      this.importBtn === 'Importing ...' ||
      this.importBtn === 'Exporting ...'
    ) {
      return;
    }
    if (this.importBtn === 'Import') {
      this.importBtn = 'Importing ...';

      this.compService
        .sendOuput('importCheckFile', this.checkUploadData.file)
        .then(res => {
          if (res.result.success) {
            if (res.result.data.status) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: res.result.data.message
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });

              this.importBtn = 'Export';
            } else {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: res.result.data.message
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              this.importBtn = 'Import';
              this.uploadDone = false;
            }
          } else {
            this.importBtn = 'Import';
            this.uploadDone = false;
            this.checkError = res.result.message;
          }
        });
    } else if (this.importBtn === 'Export') {
      this.importBtn = 'Exporting ...';
      this.compService
        .sendOuput('exportItemsData', this.checkUploadData.file)
        .then(res => {
          if (res.result.success) {
            if (res.result.data.status) {
              window.open(res.result.data.data, '_self');
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Items Exported Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              this.importBtn = 'Export';
              // this.uploadDone = false;
            } else {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: 'Failed While Exporting Items'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            }
          }
        });
    }
  }
  proof1Import(ev) {
    if (this.prog1 === true) {
      return;
    }
    this.prog1 = true;
    this.compService
      .sendOuput('importFileCompare', this.proof1UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.impSucces = true;
            this.proof1ImpScs = true;
            this.prog1 = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        } else {
          this.importBtn = 'Import';
          this.uploadDone = false;
          this.checkError = res.result.message;
        }
        this.prog1 = false;
      });
  }
  proof1Export(ev) {
    if (this.prog1 === true) {
      return;
    }
    this.prog1 = true;
    this.compService
      .sendOuput('exportItemsData', this.proof1UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            window.open(res.result.data.data, '_self');
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Items Exported Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.importBtn = 'Import';
            this.prog1 = false;
            // this.uploadDone = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Failed While Exporting Items'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
        this.prog1 = false;
      });
  }
  proof2Import(ev) {
    if (this.prog2 === true) {
      return;
    }
    this.prog2 = true;
    this.compService
      .sendOuput('importFileCompare', this.proof2UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.impSucces1 = true;
            this.proof2ImpScs = true;
            this.prog2 = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        } else {
          this.importBtn = 'Import';
          this.uploadDone = false;
          this.checkError = res.result.message;
        }
        this.prog2 = false;
      });
  }
  proof2Export(ev) {
    if (this.prog2 === true) {
      return;
    }
    this.compService
      .sendOuput('exportItemsData', this.proof2UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            window.open(res.result.data.data, '_self');
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Items Exported Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.importBtn = 'Import';
            // this.uploadDone = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Failed While Exporting Items'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
      });
  }
  cmpExport() {
    if (this.CompExptBtn === 'Comparing Please Wait') {
      return;
    }
    this.CompExptBtn = 'Comparing Please Wait';
    let compParams = {
      proof1: this.proof1UploadData.file.filename,
      proof1_original_name: this.proof1UploadData.file.original_name,
      proof2_original_name: this.proof2UploadData.file.original_name,
      proof2: this.proof2UploadData.file.filename
    };
    this.compService.sendOuput('compareAndExport', compParams).then(res => {
      this.CompExptBtn = 'Comparing Please Wait';
      if (res.result.success) {
        if (res.result.data.status) {
          window.open(res.result.data.data, '_self');
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Items Exported Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.CompExptBtn = 'Compare and Export';
          // this.uploadDone = false;
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: res.result.data.data
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.CompExptBtn = 'Compare and Export';
        }
      }
    });
  }
}
