import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UsersService } from '@app/users/users.service';

import { FileUploader } from 'ng2-file-upload';

const APP: any = window['APP'];

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploaderComponent implements OnInit {
  public image_url = APP.img_url;
  private imageUploadUrl = APP.api_url + 'uploadProfile?container=user_profile';
  public deleteLogo = APP.img_url + 'delete_add.png';
  public default_logo = APP.api_url + 'public/images/default_user.png';
  public hasDropZoneOver = false;
  public uploader: FileUploader = new FileUploader({
    url: this.imageUploadUrl,
    allowedMimeType: ['image/png', 'image/jpeg', 'image/jpg'],
    maxFileSize: 5 * 1024 * 1024,
    autoUpload: true
  });
  public uploadError = false;
  public progress = false;
  public success = false;
  public error = false;
  sizeError: boolean;
  uploads = [];
  public state = {
    disableSave: true
  };

  constructor(
    private userService: UsersService,
    private dialogRef: MatDialogRef<UploaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.uploader.onBeforeUploadItem = (fileItem: any) => {
      fileItem.formData.push({ container: 'user_profile' });
    };
    this.uploader.onWhenAddingFileFailed = (
      item: any,
      filter: any,
      options: any
    ) => {
      // this.uploadError = true;
      this.remove();
      if (item.size >= options.maxFileSize) {
        this.sizeError = true;
        this.uploadError = false;
      } else {
        this.uploadError = true;
        this.sizeError = false;
      }
    };

    this.uploader.onAfterAddingFile = (item: any) => {
      // this.pointerEvent = true;
    };

    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      const obj = JSON.parse(response);
      if (obj.result.success) {
        this.state.disableSave = false;
        this.uploadError = false;
        this.sizeError = false;
        this.uploads = [];
        this.uploads.push(obj.result.data.data);
        this.data.image = obj.result.data.data.src;
      }
    };
  }

  ngOnInit() {}

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    let params = {};
    this.progress = true;
    if (this.data.params) {
      params = Object.assign(params, this.data.params);
    }
    params['id'] = this.data.id;
    if (this.uploads.length) {
      params['image_name'] = this.uploads[0].filename;
      // params['original_name'] = this.uploads[0].original_name;
      // params['src_name'] = this.uploads[0].source_path;
    } else {
      params['image_name'] = '';
    }
    this.userService[this.data.saveUrl](params).then(response => {
      if (response.result.success) {
        this.progress = false;
        this.success = true;

        let filename;
        filename = response.result.data.data.src;
        setTimeout(() => {
          this.dialogRef.close({
            success: true,
            data: params,
            fileName: filename
          });
        }, 1000);
      } else {
        this.error = true;
      }
    });
  }

  remove(): void {
    let params = {};
    if (this.data.removeParams) {
      params = Object.assign(params, this.data.removeParams);
    }
    params['id'] = this.data.id;
    params['image_name'] = '';
    this.state.disableSave = false;
    this.data.image = '';
    if (this.uploads.length) {
      this.uploads[0].filename = '';
    }
  }

  fileOverBase(ev) {}

  fileDrop(ev) {}
}
