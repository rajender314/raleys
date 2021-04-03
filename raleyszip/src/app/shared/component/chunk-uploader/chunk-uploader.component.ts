import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { FlowDirective, Transfer } from '@flowjs/ngx-flow';
import { Subscription } from 'rxjs';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];

@Component({
  selector: 'app-chunk-uploader',
  templateUrl: './chunk-uploader.component.html',
  styleUrls: ['../excel-uploader/excel-uploader.component.scss']
})
export class ChunkUploaderComponent implements AfterViewInit {
  @ViewChild('flowAdvanced')
  flow: FlowDirective;
  public importImg = APP.img_url + 'file-upload.png';
  public flowConfig = {
    target: 'uploadFeatureItems',
    singleFile: true,
    allowDuplicateUploads: true,
    testChunks: false,
    chunkSize: 1024 * 1024,
    query: {
      ad_id: this.appService.adId
    }
  };
  public flowAttributes = {
    accept: '.csv,.txt,.CSV,.TXT'
  };
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
  autoUploadSubscription: Subscription;
  constructor(private appService: AppService) {}

  ngAfterViewInit() {
    // this.triggerUpld();
  }

  triggerUpld() {
    this.autoUploadSubscription = this.flow.events$.subscribe(event => {
      // to get rid of incorrect `event.type` type you need Typescript 2.8+
      if (event.type === 'newFlowJsInstance') {
      } else if (event.type === 'fileAdded') {
        this.fileImporting = true;
      } else if (event.type === 'filesSubmitted') {
        // this.fileImporting = false;
        this.fileData = this.flow.flowJs.files[0].file;
        if (this.flow.flowJs.getSize() < 157286400) {
          this.flow.upload();
        } else {
          this.sizeError = true;
          this.uploadError = false;
          this.onlyHeadersError = false;
        }
      } else if (event.type === 'uploadStart') {
        this.fileUploadStart.emit({
          status: 'file-upload-started'
        });
      } else if (event.type === 'fileProgress') {
      } else if (event.type === 'fileSuccess') {
        this.fileImporting = false;
        this.fileImporting = true;
        let obj = JSON.parse(event.event[1] as any);
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
          // this.fileData = { original_name: this.flow.flowJs.files[0].name };
          this.onlyHeadersError = true;
          this.state.disableSave = true;
          this.onlyHeadersErrorMsg = obj.result.data.message;
        }
      } else if (event.type === 'progress') {
      } else if (event.type === 'complete') {
        this.fileImporting = false;
      } else if (event.type === 'fileError') {
        this.fileImporting = false;
      } else if (event.type === 'error') {
        this.fileImporting = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.autoUploadSubscription) {
      this.autoUploadSubscription.unsubscribe();
    }
  }

  trackTransfer(transfer: Transfer) {
    return transfer.id;
  }
}
