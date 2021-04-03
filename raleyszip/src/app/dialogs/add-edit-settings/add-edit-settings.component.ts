import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AppService } from '@app/app.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { AdsService } from '@app/ads/ads.service';
import { CustomValidation } from '@app/shared/utility/custom-validations';
const APP: any = window['APP'];

@Component({
  selector: 'app-add-edit-settings',
  templateUrl: './add-edit-settings.component.html',
  styleUrls: ['./add-edit-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddEditSettingsComponent implements OnInit {
  public headersData = [];
  public settingsListForm: FormGroup;
  public modColors: any;
  public selectedRow: any;
  public listData: any;
  public type: any;
  public submitted = false;
  public error: any;
  public vehiclesData = [];
  public enableSave = false;
  public savedSearchImgs = [];
  public tagsList = '';
  public offerTypes = [];
  public imageAssestsInfo = {
    search: '',
    assetType: '',
    pageSize: 20,
    pageNumber: 1
  };
  public assestsCollection = [];
  public selectedAssests = [];
  public selectedAssestsArray = [];
  public noData = true;
  public progress = false;
  public searchMsg = 'Search For Icons';
  public triggerFunc = '';
  public uploadedImgs = [];
  public searchImgs = [];
  public searchVal = '';
  public divisonsList = [];
  public dataStatus = true;
  public toggleClass = false;
  public modNumberPattern = /^(0|[1-9]\d*)$/;
  public deleteLogo = APP.img_url + 'delete_add.png';

  public sysImgUrl = APP.api_url + 'public/storage/uploads/icons/';

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    private appService: AppService,
    private settingsService: SettingsService,
    private adsService: AdsService,
    private dialogRef: MatDialogRef<AddEditSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.listData = this.data.listData;
    if (this.data.type === 'edit' && this.listData.key === 'ICONS') {
      // this.selectedAssests = this.data.selectedRow.search_images;
      this.uploadedImgs = [...this.data.selectedRow.upload_images];
      this.searchImgs = [...this.data.selectedRow.search_images];
      this.savedSearchImgs = [...this.data.selectedRow.search_images];
      this.selectedAssestsArray = [...this.data.selectedRow.image_links];
      if (this.data.selectedRow.icon_tags.length) {
        this.tagsList = this.data.selectedRow.icon_tags.join('|');
      }
    }
    // if (this.listData.key === 'ICONS') {
    //  // this.getDivisions();
    // }
    // if (this.listData.key === 'MOD_TYPE') {
    //   console.log((this.type === 'edit') ? ((this.selectedRow) ? this.selectedRow.mod_type_color_id : undefined) : undefined);
    //   this.settingsService.getModTypeColors({
    //     mod_type_color_id:
    //       (this.type === 'edit') ? ((this.selectedRow) ? this.selectedRow.mod_type_color_id : undefined) : undefined
    //   })
    //     .then(res => {
    //       this.modColors = res.result.data;
    //     });
    // }
    this.type = this.data.type;
    this.headersData = this.data.headersData;
    // this.modColors = this.data.modColors;
    this.selectedRow = this.data.selectedRow;
    this.listData = this.data.listData;
    this.vehiclesData = this.data.vehiclesData;
    this.settingsListForm = this.data.settingsListForm;
    this.offerTypes = this.data.offerTypes;
    this.createForm();
  }

  setAddEditFormValues() {
    // while editing only this will be called.
    if (this.data.type === 'edit') {
      const levels = [];
      this.headersData.forEach(val => {
        this.selectedRow.status = +this.selectedRow.status;
        levels.push(this.selectedRow);
      });
      this.settingsListForm.patchValue({
        settingsFormValues: levels
      });
    }
  }

  createForm() {
    // settings list form.
    this.settingsListForm = this.fb.group({
      settingsFormValues: this.fb.array([])
    });
    this.createControls();
  }

  public get settingsFormValues() {
    return this.settingsListForm.get('settingsFormValues') as FormArray;
  }
  createControls() {
    let i = 0;
    this.headersData.forEach(attr => {
      this.settingsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    if (this.data.type == 'edit') {
      this.setAddEditFormValues();
    }
  }

  createFormGroup(data, idx) {
    let obj;
    if (data.key === 'dropdown' || data.key === 'multiple_choice') {
      if (data.get_api) {
        if (data.db_column_key === 'mod_type_color_id') {
          if (this.type == 'edit') {
            obj = { mod_type_color_id: this.selectedRow.mod_type_color_id };
          } else {
            obj = { status: [1] };
          }
        } else {
          if (this.type == 'edit') {
            obj = '';
          } else {
            obj = { status: [1] };
          }
        }
        this.appService.getDropdownOptions(data.get_api, obj).then(res => {
          data.options = res.result.data.data;
          this.headersData[idx].options = res.result.data.data;
        });
      }
    }
    if (data.db_column_key === 'no_of_mods') {
      return this.fb.group({
        [data.db_column_key]: [
          '',
          [
            data.form_save_value.settings.mandatory
              ? Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(100),
                  Validators.pattern(this.modNumberPattern)
                ])
              : ''
          ]
        ]
      });
    } else {
      if (data.key === 'single_line_text') {
        return this.fb.group({
          [data.db_column_key]: [data.form_save_value.settings.mandatory]
            ? [
                '',
                Validators.compose([
                  Validators.required,
                  CustomValidation.noWhitespaceValidator
                ])
              ]
            : ''
        });
      } else {
        return this.fb.group({
          [data.db_column_key]: [data.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ''
        });
      }
    }
  }
  getDivisions() {
    let params = {
      column: '',
      pageNumber: 1,
      pageSize: 20,
      search: '',
      sort: 'asc'
    };
    this.settingsService
      .getList([{ url: 'getDivisions' }, params])
      .then(res => {
        this.divisonsList = res.result.data.data;
      });
  }
  onSearch(event: any): void {
    this.imageAssestsInfo.pageNumber = 1;
    // this.selectedAssestsArray = this.uploadedImgs;
    this.imageAssestsInfo.search = event; // this.getAssets();
  }
  getAssets() {
    // if(this.imageAssestsInfo.search === this.searchVal){
    //   return;
    // }
    // else{
    // this.imageAssestsInfo.search = this.searchVal;
    // }
    this.dataStatus = true;

    this.adsService
      .getAssetInfo(this.imageAssestsInfo, 'image')
      .subscribe(res => {
        this.toggleClass = false;
        if (res['result'].success) {
          this.progress = false;
          if (this.assestsCollection.length) {
            this.assestsCollection.push(...res['result'].data.assetsData);
          } else {
            this.assestsCollection = res['result'].data.assetsData
              ? res['result'].data.assetsData
              : [];
          }
          // this.assestsCollection = res['result'].data.assetsData
          //   ? res['result'].data.assetsData
          //   : [];
          if (
            this.assestsCollection.length < 1 ||
            this.assestsCollection.length < this.imageAssestsInfo.pageSize
          ) {
            this.dataStatus = false;
          }
          // this.noData = false;
          if (!this.assestsCollection.length) {
            this.searchMsg = 'No Icons Found';
          } else {
            this.searchMsg = 'Search For Icons';
          }
        }
      });
  }

  assetSelected(assetInfo) {
    this.enableSave = true;
    if (this.selectedAssestsArray.length > 3) {
      return;
    }
    assetInfo.selected = !assetInfo.selected;
    this.selectedAssests = [];
    this.selectedAssests = _.filter(this.assestsCollection, function(o) {
      if (o.selected === true) {
        return o;
      }
    });
    // selAssests.map(o =>{
    //     let asstIdx = _.findIndex( this.selectedAssestsArray, { assetId: o.assetId });
    //     if(asstIdx < 0){
    //       this.selectedAssests.push(o);
    //     }
    // })
    // this.searchImgs = this.selectedAssests;
    this.selectedAssests = _.uniqBy(this.selectedAssests, 'assetId');
    this.selectedAssestsArray = this.selectedAssests
      .concat(this.uploadedImgs)
      .concat(this.searchImgs);
    this.selectedAssestsArray = _.uniqWith(
      this.selectedAssestsArray,
      _.isEqual
    );

    if (
      this.selectedAssests.length === 1 &&
      this.selectedAssestsArray.length === 1
    ) {
      if (this.selectedAssests[0].default === false) {
        this.selectedAssests[0].default = true;
      } else {
        this.selectedAssests[0] = Object.assign(this.selectedAssests[0], {
          default: true
        });
      }
    }
    if (this.selectedAssestsArray.length > 3) {
      this.triggerFunc = 'disable';
    } else {
      this.triggerFunc = 'enable';
    }
  }
  assetOperations(assetInfo) {
    // console.log(assetInfo);
  }
  closeDialog = () => {
    this.dialogRef.close();
    this.settingsListForm.reset();
  };
  clearVal = () => {
    if (!this.imageAssestsInfo.search) {
      this.searchMsg = 'Search For Icons';
    }
  };
  deleteImg(asset) {
    this.searchImgs = this.searchImgs.concat(this.selectedAssests);
    this.searchImgs = _.uniqBy(this.searchImgs, 'assetId');
    event.stopPropagation();
    this.enableSave = true;
    const serchIdx = _.findIndex(this.searchImgs, { assetId: asset.assetId });
    // let serchIdx = this.searchImgs.indexOf(asset);
    let selIdx = this.selectedAssests.indexOf(asset);
    let upldIdx = _.findIndex(this.uploadedImgs, {
      previewUrl: asset.previewUrl
    });
    if (selIdx > -1) {
      this.selectedAssests.splice(selIdx, 1);
    }
    if (upldIdx > -1) {
      this.triggerFunc = 'delete';
      if (this.uploadedImgs[upldIdx].default) {
        this.uploadedImgs.splice(upldIdx, 1);
        if (this.uploadedImgs.length > 0) {
          this.defaultImg(this.uploadedImgs[0]);
        } else if (this.searchImgs.length > 0) {
          this.defaultImg(this.searchImgs[0]);
        }
      } else {
        this.uploadedImgs.splice(upldIdx, 1);
      }
    }
    if (serchIdx > -1) {
      this.searchImgs[serchIdx].selected = false;
      if (this.searchImgs[serchIdx].default) {
        this.searchImgs.splice(serchIdx, 1);
        if (this.searchImgs.length > 0) {
          this.defaultImg(this.searchImgs[0]);
        } else if (this.uploadedImgs.length > 0) {
          this.defaultImg(this.uploadedImgs[0]);
        }
      } else {
        this.searchImgs.splice(serchIdx, 1);
      }
    }
    // if (serAsstIdx > -1) {
    //   this.selectedAssestsArray.splice(serAsstIdx, 1);
    // }
    // if (savedSearchImgsIdx > -1) {
    //   this.savedSearchImgs.splice(savedSearchImgsIdx, 1);
    // }
    if (this.selectedAssestsArray.length < 4) {
      this.triggerFunc = 'enable';
    }
    this.selectedAssestsArray = this.searchImgs.concat(this.uploadedImgs);
  }
  defaultImg(asset) {
    this.searchImgs = this.searchImgs.concat(this.selectedAssests);
    this.searchImgs = _.uniqBy(this.searchImgs, 'assetId');
    event.stopPropagation();
    this.enableSave = true;
    const serchIdx = _.findIndex(this.searchImgs, { assetId: asset.assetId });
    let savedSearchImgsIdx = _.findIndex(this.savedSearchImgs, {
      assetId: asset.assetId
    });
    let selIdx = this.selectedAssestsArray.indexOf(asset);
    let upldIdx = _.findIndex(this.uploadedImgs, {
      previewUrl: asset.previewUrl
    });
    this.selectedAssestsArray = this.loopDefault(this.selectedAssestsArray);
    this.uploadedImgs = this.loopDefault(this.uploadedImgs);
    this.searchImgs = this.loopDefault(this.searchImgs);
    this.savedSearchImgs = this.loopDefault(this.savedSearchImgs);
    // this.selectedAssests.map(asset =>{
    //   if(asset.default){
    //     asset.default = !asset.default;
    //   }
    // })
    // this.uploadedImgs.map(asset =>{
    //   if(asset.default){
    //     asset.default = !asset.default;
    //   }
    // })
    // this.searchImgs.map(asset =>{
    //   if(asset.default){
    //     asset.default = !asset.default;
    //   }
    // })
    this.selectedAssestsArray = this.makeDefault(
      selIdx,
      this.selectedAssestsArray
    );
    this.uploadedImgs = this.makeDefault(upldIdx, this.uploadedImgs);
    this.searchImgs = this.makeDefault(serchIdx, this.searchImgs);
    this.savedSearchImgs = this.makeDefault(
      savedSearchImgsIdx,
      this.savedSearchImgs
    );
  }
  loopDefault(arr) {
    arr.map(asst => {
      if (asst.default) {
        asst.default = !asst.default;
      }
    });
    return arr;
  }
  makeDefault(idx, arr) {
    if (idx > -1) {
      if (arr[idx].default === false) {
        arr[idx].default = true;
      } else {
        arr[idx] = Object.assign(arr[idx], { default: true });
      }
    }
    return arr;
  }

  updateList(form) {
    this.submitted = true;
    let obj = {};
    if (this.type === 'edit') {
      if (this.selectedRow) {
        obj['id'] = this.selectedRow.id;
      }
    }
    //   let key;
    //   // form.value.settingsFormValues.forEach(item => {
    //   for(key in form.value.settingsFormValues) {

    //     if(form.value.settingsFormValues[key] === null) {

    //       form.value.settingsFormValues.splice(form.value.settingsFormValues[key], 1);

    //     }
    //   }
    // // })
    // form.value.settingsFormValues[2].icon_tags= _.remove(form.value.settingsFormValues[2].icon_tags, [" "]);
    // form.value.settingsFormValues[2].icon_tags= _.uniq(form.value.settingsFormValues[2].icon_tags);
    // if(form.value.settingsFormValues[2].icon_tags[form.value.settingsFormValues[2].icon_tags.length] === ""){
    //   form.value.settingsFormValues[2].icon_tags.splice(form.value.settingsFormValues[2].icon_tags.length);
    // }

    if (form.valid) {
      this.submitted = false;
      if (this.listData.key === 'ICONS') {
        typeof form.value.settingsFormValues[2].icon_tags;
        if (
          form.value.settingsFormValues[2].icon_tags &&
          form.value.settingsFormValues.length > 2 &&
          typeof form.value.settingsFormValues[2].icon_tags === 'string'
        ) {
          form.value.settingsFormValues[2].icon_tags = form.value.settingsFormValues[2].icon_tags.split(
            '|'
          );
        }
      }
      form.value.settingsFormValues.forEach(item => {
        // obj['mod_type_color_id'] = obj['mod_type_color_name'];
        // obj['mod_type_color_name'] = '';
        Object.assign(obj, item);
      });

      if (this.listData.key === 'ICONS') {
        // this.searchImgs[0] = Object.assign(this.searchImgs[0], {
        //   default: true
        // });
        // this.searchImgs = this.searchImgs.concat(this.savedSearchImgs);
        // this.searchImgs = _.uniq(this.searchImgs);
        let dummyObj = {
          upload_images: this.uploadedImgs,
          search_images: this.searchImgs.concat(this.selectedAssests),
          search_value: this.imageAssestsInfo.search
        };
        obj = Object.assign(dummyObj, obj);
      }
      this.settingsService
        .updateItem([{ url: this.listData.create_api }, obj])
        .then(res => {
          if (res.result.success) {
            this.error = '';
            this.dialogRef.close(res.result);
          } else {
            if (
              res.result.success === false &&
              res.result.status_code === 401
            ) {
              this.error = res.result.data;
            }
          }
          this.submitted = false;
        });
    }
  }
  onUpload(event) {
    if (event.success) {
      this.enableSave = true;
      let uploadParams = {
        asset_name: event.data.original_name,
        thumbUrl: event.data.source_path,
        assetPath: event.data.source_path,
        previewUrl: event.data.filename
      };
      if (!this.selectedAssestsArray.length) {
        uploadParams = Object.assign(uploadParams, { default: true });
      }
      this.uploadedImgs.push(uploadParams);
      // this.selectedAssests.push(uploadParams);
      if (this.selectedAssests.length > 3) {
        this.triggerFunc = 'disable';
      } else {
        this.triggerFunc = 'enable';
      }
      this.selectedAssestsArray.push(uploadParams);
    }
  }
  valChanged(event) {
    if (event.target.id === 'icon_tags' && event.data === ' ') {
      this.tagsList = event.target.value + '|';
    }
  }
  searchAsset() {
    if (this.selectedAssestsArray.length < 4) {
      this.assestsCollection = [];
      this.progress = true;
      this.searchImgs = this.searchImgs.concat(this.selectedAssests);

      this.getAssets();
    }
  }
  onScrollDown() {
    this.imageAssestsInfo.pageNumber = this.imageAssestsInfo.pageNumber + 1;
    if (this.dataStatus) {
      this.toggleClass = true;
      this.getAssets();
    }
  }
}
