import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { ImportSkuComponent } from '@app/dialogs/import-sku/import-sku.component';
import { FileUploader } from 'ng2-file-upload';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

const APP: any = window['APP'];

@Component({
  selector: 'app-excel-uploader',
  templateUrl: './excel-uploader.component.html',
  styleUrls: ['./excel-uploader.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExcelUploaderComponent implements OnInit {
  // ?container=file

  private imageUploadUrl = APP.api_url + 'uploadAttachments';
  public hasDropZoneOver = false;
  importedFileProgress: 0;

  public dialogRef: any;
  public uploadError = false;
  public fromComp = '';
  public progress = false;
  public success = false;
  public error = false;
  public fileImporting = false;
  public fileData: any;
  public uploadData: any;
  public upload_error: any;
  public totalUploadData: any;
  public importImg = APP.img_url + 'file-upload.png';
  public disCrush = true;
  public disCrushDwld = true;
  sizeError: boolean;
  public fileMatch: any;
  public onlyHeadersError = false;
  public onlyHeadersErrorMsg: string;
  uploads = [];
  public state = {
    disableSave: true
  };

  @Input() importdata;
  @Input() impSucces;
  @Input() impSucces1;
  @Input() prog1;
  @Input() prog2;
  @Output() importSuccess = new EventEmitter<any>();
  @Output() importStarts = new EventEmitter<any>();
  @Output() fileUploadDone = new EventEmitter<any>();
  @Output() fileUploadStart = new EventEmitter<any>();
  @Output() crush = new EventEmitter<any>();
  @Output() dwnldCrush = new EventEmitter<any>();

  @ViewChild('activeFrameInputFile') InputFrameVariable: ElementRef;

  public uploader: FileUploader = new FileUploader({
    url: this.imageUploadUrl,
    allowedMimeType: [
      //'application/vnd.ms-excel', 'text/csv'
      // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // // this.importdata.key ?   'text/csv' : '',
    ],
    // allowedFileType: [],
    maxFileSize: 150 * 1024 * 1024,
    autoUpload: true
  });
  constructor(
    public dialog: MatDialog, // private dialogRef: MatDialogRef<ExcelUploaderComponent>, // @Inject(MAT_DIALOG_DATA) public data
    public adsService: AdsService,
    private appService: AppService,
    private snackbar: MatSnackBar
  ) {
    this.uploader.onBeforeUploadItem = (fileItem: any) => {
      this.fileUploadStart.emit({
        status: 'file-upload-started'
      });
      this.fileImporting = true;
      this.disCrush = true;
      this.disCrushDwld = true;
      const url = this.importdata.url;
      fileItem.formData.push({ container: 'user_profile' });

      this.uploader.setOptions({ url: APP.api_url + url });
    };
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      // console.log(this.importdata);
      this.fileMatch = '';
      form.append('container', this.importdata.container);
      if (this.importdata.url == 'uploadFeatureItems') {
        form.append('ad_id', this.appService.adId);
      }
      // note comma separating key and value
    };
    this.uploader.onWhenAddingFileFailed = (
      item: any,
      filter: any,
      options: any
    ) => {
      this.fileUploadStart.emit({
        status: true
      });
      this.importedFileProgress = 0;
      // this.uploadError = true;
      this.fileData = { original_name: item.name };
      if (item.size >= options.maxFileSize) {
        this.sizeError = true;
        this.uploadError = false;
        this.onlyHeadersError = false;
      } else {
        this.uploadError = true;
        this.onlyHeadersError = false;
        this.sizeError = false;
      }
      this.fileImporting = false;
    };

    this.uploader.onAfterAddingFile = (item: any) => {
      this.uploadError = false;
      this.sizeError = false;
      this.onlyHeadersError = false;
      this.fileMatch = '';
      this.importedFileProgress = item.progress;
      // this.pointerEvent = true;
    };

    this.uploader.onCompleteAll = () => {
      //  this.InputFrameVariable.nativeElement.value = '';
    };
    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      this.fileImporting = false;
      this.importedFileProgress = item.progress;
      const obj = JSON.parse(response);
      if (obj.result.data.status) {
        this.onlyHeadersError = false;
        this.state.disableSave = false;
        this.uploadError = false;
        this.sizeError = false;
        this.uploads = [];
        this.uploads.push(obj.result.data.data);
        this.totalUploadData = obj.result.data;
        this.fileData = obj.result.data.file || obj.result.data;
        this.fileUploadDone.emit({
          status: true,
          data: this.totalUploadData
        });
        this.disCrush = false;
        if (!obj.result.data.status) {
          this.upload_error = obj.result.data.data;
        } else {
          this.upload_error = '';
        }
        // this.data.image = obj.result.data.data.src;
      } else {
        this.fileData = { original_name: item._file.name };
        this.onlyHeadersError = true;
        this.state.disableSave = true;
        this.onlyHeadersErrorMsg = obj.result.data.message;
      }
    };
  }

  ngOnInit() {
    this.fromComp = this.importdata.fromComp ? this.importdata.fromComp : '';
    this.fileMatch = '';
    if (this.importdata.format === 'csv') {
      this.uploader.options.url = this.importdata.url;
      this.uploader.options.allowedMimeType.push('text/csv');
      this.uploader.options.allowedMimeType.push('text/plain');
      this.uploader.options.allowedMimeType.push('application/vnd.ms-excel');
      // this.uploader.options.allowedFileType.push('application/csv');
      this.uploader.options.filters.push({
        name: 'csv',
        fn: (item: any): boolean => {
          const fileExtension = item.name
            .slice(item.name.lastIndexOf('.') + 1)
            .toLowerCase();
          if (fileExtension === 'csv' || fileExtension === 'txt') {
            return true;
          } else {
            return false;
          }
        }
      });
      this.importImg = APP.img_url + 'file-upload.png';
    } else {
      this.uploader.options.allowedMimeType.push('application/vnd.ms-excel');
      this.uploader.options.allowedMimeType.push(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      // this.uploader.options.filters.push({
      //   name: 'xls',
      //   fn: (item: any): boolean => {
      //     const fileExtension = item.name.slice(item.name.lastIndexOf('.') + 1).toLowerCase();
      //     return fileExtension === 'xls';
      //   }
      // });
      // this.uploader.options.filters.push({
      //   name: 'xlsx',
      //   fn: (item: any): boolean => {
      //     const fileExtension = item.name.slice(item.name.lastIndexOf('.') + 1).toLowerCase();
      //     return fileExtension === 'xlsx';
      //   }
      // });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  import(): void {
    this.progress = true;
    this.importStarts.emit({
      status: false
    });
    if (this.importdata.format === 'csv') {
      const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
      this.adsService
        .importFeatureItems(Object.assign(obj, this.totalUploadData))
        .then(res => {
          if (res.result.data.status) {
            this.importSuccess.emit({
              status: true
            });
          } else {
            this.fileMatch = res.result.data.message;
          }
          this.progress = false;
        });
      // setTimeout(() => {
      //   this.progress = false;
      // }, 2000);
    } else if (this.importdata.format === 'xls') {
      const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
      this.adsService
        .importXls('importDivisions', this.totalUploadData)
        .then(res => {
          if (res.result.data.status) {
            this.importSuccess.emit({
              status: true
            });
          } else {
            this.fileMatch = res.result.data.message;
          }
          this.progress = false;
        });
    } else {
      this.dialogRef = this.dialog.open(ImportSkuComponent, {
        panelClass: ['import-sku-modal', 'overlay-dialog'],
        width: '800px',
        data: {
          importData: this.totalUploadData
        }
      });
      this.progress = false;
      this.dialogRef.afterClosed().subscribe(result => {
        if (result && result.data.status) {
          this.state.disableSave = true;
          this.fileData = null;
          this.importSuccess.emit({
            status: true
          });
        }
      });
    }
  }

  fileOverBase(ev) {}

  fileDrop(ev) {}

  crushDwnld() {
    this.dwnldCrush.emit({
      status: true
    });
  }
  crushImp() {
    this.crush.emit({
      status: true
    });
  }
}
