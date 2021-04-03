import {
  Component,
  OnInit,
  ViewEncapsulation,
  Inject,
  ViewChild,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  SimpleChanges,
  ɵConsole
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatSnackBar,
  MatExpansionPanel,
  MatDatepicker
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { AppService } from '@app/app.service';
import { ImageAssestsComponent } from '../image-assests/image-assests.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { CreateSignageComponent } from '@app/dialogs/create-signage/create-signage.component';

// import {fromEvent, merge,  timer, Observable } from 'rxjs';
// import {debounce, map} from 'rxjs/operators';

const APP: any = window['APP'];

@Component({
  selector: 'app-edit-mod',
  templateUrl: './edit-mod.component.html',
  styleUrls: ['./edit-mod.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class EditModComponent implements OnInit {
  @ViewChild('rev1Panel') rev1Panel: MatExpansionPanel;
  @ViewChild('rev2Panel') rev2Panel: MatExpansionPanel;
  @Input('editModInputData') data: any;
  @Output() closeEdit: EventEmitter<any> = new EventEmitter();
  offerTypeArray = [];
  public offerTypeInactive = [];
  selectedPageData: any;
  activeModData: any;

  public offerUnits: any;
  public previousModPromoId: any;
  public offerVarieties: any;
  public currentPromoData = [];
  public revision1PromoData = [];
  public revision2PromoData = [];
  public promoHeaders = [];
  public updatedColumns = [];
  private selectedTabIndex = 0;
  public selectedOfferType = '';
  public dialogRef1: any;
  public dialogRef2: any;
  public dialogRef3: any;
  public dialogRefSplitMod: any;
  public selectedPage: any;
  public selectedModId: any;
  public assetType = '';
  public search = '';
  public image_url = APP.img_url + 'no-mod-image.png';
  public refreshData = false;
  public rowData = [];
  private getRowNodeId;
  public gridApi: any;
  public gridColumnApi: any;
  public gridApiRev1: any;
  public gridColumnApiRev1: any;
  public gridApiRev2: any;
  public gridColumnApiRev2: any;
  public allAutoSizeColumns = [];
  public columnDefs = [];
  public columnDefsRev = [];
  public filteredMods = [];
  public gridVisibility = false;
  public gridVisibilityRev1 = false;
  public gridVisibilityRev2 = false;
  public pointerEvents = false;
  public pointerEventsRev1 = false;
  public pointerEventsRev2 = false;
  public enableSaveBtn = false;
  public dataLoad = true;
  public minStrtDate = moment(new Date()).add(0, 'days')['_d'];
  public maxStrtDate = '';
  public minEndDate = moment(new Date()).add(0, 'days')['_d'];
  public maxEndDate = '';
  public formReady = false;
  public selectedRowsData = {
    page_id: '',
    mod_id: '',
    promotions: []
  };
  public noData: any;
  public noModDetails: any;
  public searchWord: any;
  public editModForm: FormGroup;
  public leftSliderValue = false;
  public unitOptions = [{ id: 'EA', name: 'EA' }, { id: 'LB', name: 'LB' }];
  public updatingInfo = false;
  public pricingHeaders = [];
  public pricingData = [];
  public pricingValues: any;
  public dialogRef: any;
  public ca_crv = {
    key: 'CA CRV'
  };
  public offerStartDdate;
  public offerEndDate;

  public saveCopyOptions = [
    { id: 'Save', name: 'Save' },
    { id: 'Save up to', name: 'Save up to' }
  ];
  @ViewChild('searchingBox') searchingBox;
  constructor(
    // public dialogRef: MatDialogRef<EditModComponent>,
    public dialog: MatDialog,
    public adsService: AdsService,
    public appService: AppService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar // @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.leftSliderValue = false;
    this.createForm();
    this.getRowNodeId = function(data) {
      return data.item_id;
    };
  }

  ngOnInit() {
    this.leftSliderValue = false;
    this.leftSlider('init');
    let i = 0;
    this.getOfferForms();
    this.getUnitVarieties();
    // this.offerTypeArray = [
    //   { id: 1, name: 'bogo' },
    //   { id: 2, name: 'bogo1' },
    //   { id: 3, name: 'bogo2' }
    // ];
    this.selectedPageData = _.cloneDeep(this.data.modData);
    // this.selectedPageData = this.data.modData;

    this.activeModData = _.cloneDeep(this.data.currMod);
    if (this.editModForm) {
      // this.editModForm.patchValue(this.activeModData);
      // this.editModForm.setValue({
      //   offer_start_date: moment(this.activeModData.offer_start_date),
      // })
      if (this.activeModData.offer_start_date) {
        this.editModForm.controls['offer_start_date'].setValue(
          moment(this.activeModData.offer_start_date)
        );
      } else {
        this.editModForm.controls['offer_start_date'].setValue(
          moment(this.activeModData.offer_start_date)
        );
      }

      this.enableSaveBtn = false;
    }
    this.minEndDate = moment(new Date()).add(0, 'days')['_d'];
    this.minStrtDate = moment(new Date()).add(0, 'days')['_d'];
    if (this.activeModData['offer_start_date']) {
      if (
        moment(this.activeModData['offer_start_date']).diff(
          moment(new Date()),
          'days'
        ) >= 0
      ) {
        this.minEndDate = moment(this.activeModData['offer_start_date']).add(
          0,
          'days'
        )['_d'];
      }
    }
    if (this.activeModData['offer_end_date']) {
      // if (moment(this.activeModData['offer_end_date']).diff(moment(new Date()), 'days') >= 0) {
      this.maxStrtDate = moment(this.activeModData['offer_end_date']).add(
        0,
        'days'
      )['_d'];

      // }
    }
    this.selectedPage = this.data.selectedPage;
    this.selectedRowsData.mod_id = this.activeModData.mod_id;
    this.selectedRowsData.page_id = this.selectedPageData.page_id;
    this.selectedOfferType = this.activeModData['offer_type_id']
      ? this.activeModData['offer_type_id']
      : '';
    this.getPricingData(this.selectedOfferType, 'init');

    this.selectedPageData.mod_details.map(x => {
      x['mod_orderName'] = 'mod ' + x['mod_order'];
      x['statusName'] = x['status'] == 1 ? 'Pending' : 'Completed';
    });
    this.getActiveMod(this.activeModData, 'init');
    // this.getCurrentPromotion();
    // this.getPromotionRevision();
    // for (let i = 0; i <= 6; i++) {
    //   this.activeModData.images.push({
    //     path: APP.img_url + 'no-image.png'
    //   });
    // }

    // for (let i = 0; i <= 6; i++) {
    //   this.activeModData.logos.push({
    //     path: APP.img_url + 'no-image.png'
    //   });
    // }
    //   this.bindKeypressEvent().subscribe(($event: KeyboardEvent) => this.onKeyPress($event));

    // this.editModForm.valueChanges.subscribe(data => {
    //   if (this.editModForm.valid) {
    //     this.enableSaveBtn = true;
    //   } else {
    //     this.enableSaveBtn = false;
    //   }
    //   this.activeModData.introduction_copy_statement = data.introduction_copy_statement;
    //   this.activeModData.mainline_copy_statement = data.mainline_copy_statement;
    //   let dummyJson = {};
    //         data.pricing_values.map(attr => {
    //     Object.assign(dummyJson, attr);
    //   });
    //   this.activeModData.regular_price = dummyJson['regular_price'] ? dummyJson['regular_price'] : '';
    // });
  }

  getOfferForms() {
    this.appService.getForms().then(data => {
      // data.result.data.data[4] = Object.assign({}, data.result.data.data[4], {
      //   inactive: true
      // });
      this.offerTypeArray = [];
      if (data.result.data.data.length) {
        let i = 0;
        data.result.data.data.map(val => {
          if (val.status) {
            this.offerTypeArray.push(val);
          } else {
            this.offerTypeInactive.push(val);
          }
        });
        if (
          this.activeModData['is_delete'] == 1 ||
          this.activeModData['status'] == 2
        ) {
          this.offerTypeArray.push({
            id: this.activeModData['offer_type_id'],
            name: this.activeModData['offer_type'],
            status: this.activeModData['status']
          });
        }
        this.offerTypeInactive = _.uniqBy(this.offerTypeInactive, 'id');
      }
      // this.offerTypeArray = data.result.data.data;
    });
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridApi.sizeColumnsToFit();
    this.autoSizeColumns();
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 500);
    }, 200);
    // if (this.gridApi) {
    //   this.gridApi.forEachNode(node => {
    //     console.log(node);
    //   });
    // }
  }

  onGridReadyRev1(params) {
    this.gridApiRev1 = params.api;
    this.gridColumnApiRev1 = params.columnApi;
    this.autoSizeColumnsRev1();

    setTimeout(() => {
      this.gridVisibilityRev1 = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEventsRev1 = true;
      }, 500);
    }, 200);
  }
  onCellClicked(params) {
    if (params.colDef.field === 'sku_no') {
      if (this.adsService.isImportProgess) {
        return;
      }
      this.dialogRef = this.dialog.open(CreateSignageComponent, {
        panelClass: ['overlay-dialog'],
        width: '850px',
        data: {
          title: 'Add Promotion',
          pageNumber: 1,
          pageSize: 10,
          flag: 'ads_list',
          skuValues: params.value.toString(),
          skuPromozId: params.data.id,
          modId: this.selectedModId,
          promoFrom: 'promoSku'
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        if (res && res.res.result.success) {
          let data = res.res.result.data.mod_data;
          let idx = _.findIndex(this.selectedPageData.mod_details, {
            mod_id: data ? data.mod_id : ''
          });
          if (idx > -1 && data) {
            this.selectedPageData.mod_details[
              idx
            ].dept_callout = data.dept_callout ? data.dept_callout : '';
            this.selectedPageData.mod_details[
              idx
            ].descriptor_copy_statement = data.descriptor_copy_statement
              ? data.descriptor_copy_statement
              : '';
            this.selectedPageData.mod_details[
              idx
            ].introduction_copy_statement = data.introduction_copy_statement
              ? data.introduction_copy_statement
              : '';
            this.selectedPageData.mod_details[
              idx
            ].mainline_copy_statement = data.mainline_copy_statement
              ? data.mainline_copy_statement
              : '';
            this.selectedPageData.mod_details[idx].unit = data.unit
              ? data.unit
              : '';
            this.selectedPageData.mod_details[idx].variety = data.variety
              ? data.variety
              : '';
            this.selectedPageData.mod_details[idx].icons = data.icons
              ? data.icons
              : '';
            this.selectedPageData.mod_details[idx].images = data.images
              ? data.images
              : '';
            this.selectedPageData.mod_details[idx].logos = data.logos
              ? data.logos
              : '';
            this.selectedPageData.mod_details[idx].crv = data.crv
              ? data.crv
              : '';
            this.getActiveMod(this.selectedPageData.mod_details[idx], '');
          }
          // this.getList();
          // this.params.ad_id = this.appService.adId;
          // this.adsService
          //   .getAdModules([{ url: 'getPromotionView' }, this.params])
          //   .then(res => {
          //     this.rowData = res.result.data.data;
          //     this.totalCount = res.result.data.count;
          //  console.log(this.totalCount)
          // });
          // this.currentTabData = this.appService.getListData('Others', 'PROMOTIONS');
          // this.selectedList(this.currentTabData);
        }
      });
    }
  }
  onGridReadyRev2(params) {
    this.gridApiRev2 = params.api;
    this.gridColumnApiRev2 = params.columnApi;
    this.autoSizeColumnsRev2();

    setTimeout(() => {
      this.gridVisibilityRev2 = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEventsRev2 = true;
      }, 500);
    }, 200);
  }

  autoSizeColumns() {
    this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev1() {
    this.gridColumnApiRev1.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev2() {
    this.gridColumnApiRev2.autoSizeColumns(this.allAutoSizeColumns);
  }

  onSearch(event, from) {
    if (from === 'modSearch') {
      this.searchWord = this.searchingBox.searchElement.nativeElement.value;
      return;
    }
    if (this.activeModData.images.length > 11 && from == 'images') {
      if (event) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Maximum images have been selected.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      return;
    }
    if (this.activeModData.icons.length > 3 && from == 'icon_path') {
      if (event) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Maximum images have been selected.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      return;
    }
    if (event) {
      this.dialogRef1 = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['campaign-dialog', 'overlay-dialog'],
        width: '680px',
        data: {
          title: 'Add Images',
          rowData: [],
          url: '',
          from: from,
          fromComp: 'editMod',
          search: event,
          activeModData: this.activeModData
        }
      });
      this.dialogRef1.afterClosed().subscribe(res => {
        if (res.data) {
          if (res.data.assetType === 'logos') {
            this.activeModData.logos = res.data.selectedAssets;
          } else if (res.data.assetType === 'images') {
            if (this.activeModData.images.length) {
              this.activeModData.images = [
                ...this.activeModData.images,
                ...res.data.selectedAssets
              ];
            } else {
              this.activeModData.images = res.data.selectedAssets;
            }
            this.activeModData.images = _.unionBy(
              this.activeModData.images,
              'assetId'
            );
          } else if (
            res.data.assetType === 'icon_path' ||
            res.data.assetType === 'icons'
          ) {
            if (this.activeModData.icons.length) {
              this.activeModData.icons = [
                ...this.activeModData.icons,
                ...res.data.selectedAssets
              ];
            } else {
              this.activeModData.icons = res.data.selectedAssets;
            }
            this.activeModData.icons = _.unionBy(
              this.activeModData.icons,
              'assetId'
            );
          }
          if (res.data.selectedAssets.length) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg:
                  (from === 'icon_path' || from === 'icons'
                    ? 'Icons'
                    : from === 'image' || from === 'images'
                    ? 'Image'
                    : from === 'logos'
                    ? 'Logos'
                    : 'Images') + ' Updated Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.enableSaveBtn = true;
          }
        } else {
          return;
        }
      });
    }
  }
  promotionTabChanged(event) {
    this.selectedTabIndex = event.index;
    // this.getCurrentPromotion();
    this.getPromotionRevision('tabChanged');
  }
  close() {
    if (!this.enableSaveBtn) {
      this.adsService.hideHeader = false;
      this.closeEdit.emit(event);
      return;
    }
    let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: {
        // rowData: rowData,
        selectedRow: { ad_id: this.appService.adId },
        mode: 'split-mod'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.from === 'confirm') {
        this.adsService.hideHeader = false;
        this.closeEdit.emit(event);
      }
    });

    // this.adsService.hideHeader = false;
    // this.closeEdit.emit(event);

    // this.dialogRef.close();
  }
  leftSlider(from) {
    if (from == 'init') {
      this.leftSliderValue = false;
      return;
    }
    this.leftSliderValue = !this.leftSliderValue;
  }

  change(key, event) {
    if (event) {
      this.enableSaveBtn = true;
    }
    if (key == 'offer_type_id') {
      this.selectedOfferType = event;
      // this.createForm();
      this.formReady = false;
      this.getPricingData(event, 'change');
    }
  }

  createForm() {
    this.editModForm = this.fb.group({
      introduction_copy_statement: [null],
      mainline_copy_statement: [null],
      descriptor_copy_statement: [null],
      variety: [null],
      offer_type_id: [null],
      unit: [null],
      crv: [null],
      // regular_price: [null],
      // regular_qty: [null],
      // promo_price: [null],
      // promo_qty: [null],
      offer_start_date: [null],
      offer_end_date: [null],
      pricing_values: this.fb.array([])
    });
  }

  getActiveMod(mod, from) {
    // console.log(mod);
    // if (this.updatingInfo) {
    //   this.snackbar.openFromComponent(SnackbarComponent, {
    //     data: {
    //       status: 'fail',
    //       msg: 'Updating Mod Data Please Wait...'
    //     },
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right'
    //   });
    //   return;
    // }
    this.getOfferForms();
    this.selectedModId = mod.mod_id;
    this.noData = false;
    let idx = _.findIndex(this.selectedPageData.mod_details, {
      mod_id: mod.mod_id
    });
    if (from != 'split') {
      this.selectedTabIndex = 0;
    }
    this.activeModData =
      idx > -1 ? this.selectedPageData.mod_details[idx] : mod;
    if (this.editModForm) {
      // console.log(this.editModForm)
      // console.log( moment(this.activeModData.offer_start_date))
      this.editModForm.patchValue(this.activeModData);

      this.editModForm.patchValue({
        offer_start_date: moment(this.activeModData.offer_start_date),
        offer_end_date: moment(this.activeModData.offer_end_date)
      });

      // if (this.activeModData.offer_start_date ) {
      //   this.editModForm.controls['offer_start_date'].setValue(
      //     moment(this.activeModData.offer_start_date)
      //   );
      // } else {
      //   this.editModForm.controls['offer_start_date'].setValue('');
      // }
      this.enableSaveBtn = false;
    }
    // this.selectedOfferType = '';
    this.selectedOfferType = this.activeModData['offer_type_id']
      ? this.activeModData['offer_type_id']
      : '';
    this.editModForm.controls['offer_type_id'].patchValue(
      this.selectedOfferType
    );
    this.minEndDate = moment(new Date()).add(0, 'days')['_d'];
    this.minStrtDate = moment(new Date()).add(0, 'days')['_d'];
    if (this.activeModData['offer_start_date']) {
      if (
        moment(this.activeModData['offer_start_date']).diff(
          moment(new Date()),
          'days'
        ) >= 0
      ) {
        this.minEndDate = moment(this.activeModData['offer_start_date']).add(
          0,
          'days'
        )['_d'];
      }
    }
    if (this.activeModData['offer_end_date']) {
      // if (moment(this.activeModData['offer_end_date']).diff(moment(new Date()), 'days') >= 0) {
      this.maxStrtDate = moment(this.activeModData['offer_end_date']).add(
        0,
        'days'
      )['_d'];
      // }
    }

    this.selectedRowsData.mod_id = this.activeModData.mod_id;
    this.selectedOfferType = this.activeModData['offer_type_id']
      ? this.activeModData['offer_type_id']
      : '';
    if (from != 'init') {
      this.formReady = false;
      this.getPricingData(this.selectedOfferType, 'activeMod');
    }

    if (this.rev1Panel) {
      this.rev1Panel.close();
    }
    if (this.rev2Panel) {
      this.rev2Panel.close();
    }
    setTimeout(() => {
      this.enableSaveBtn = false;
    });
    this.selectedRowsData.promotions = [];
    if (this.activeModData.promotions.length) {
      this.getPromotionRevision(from);
    } else {
      this.noData = true;
      this.dataLoad = false;
    }
  }
  getCurrentPromotion() {
    this.adsService
      .getPromotionRevision({
        id: this.activeModData.promotions[this.selectedTabIndex].id
      })
      .then(res => {
        if (res.result.data.data.length) {
          this.currentPromoData = res.result.data.data[0];
        }
        this.promoHeaders = res.result.data.headers;
        this.promoHeaders.push({
          format: '',
          key: 'chkboxx',
          name: '',
          type: 'text',
          updated: 0,
          width: 100
        });
        this.updatedColumns = res.result.data.updated_columns;
      });
  }

  getUnitVarieties() {
    this.adsService.getVehicles([{ url: 'getUnitVarieties' }, {}]).then(res => {
      if (res.result.success) {
        this.offerUnits = res.result.data.units;
        this.offerVarieties = res.result.data.variety;
      }
    });
  }

  getPromotionRevision(from) {
    if (
      this.previousModPromoId ==
        this.activeModData.promotions[this.selectedTabIndex].promo_id &&
      from != 'split'
    ) {
      return;
    }
    this.previousModPromoId = this.activeModData.promotions.promo_id;
    if (this.activeModData.promotions.length) {
      this.adsService
        .getPromotionRevision({
          id: this.activeModData.promotions[this.selectedTabIndex].id,
          ad_id: this.appService.adId,
          promo_id: this.activeModData.promotions[this.selectedTabIndex]
            .promo_id
        })
        .then(res => {
          // let revData = res.result.data.data;
          let revData = res.result.data.revision_data;
          this.rowData = res.result.data.data;
          if (this.rowData.length) {
            this.noData = false;
            this.dataLoad = false;
          } else {
            this.noData = true;
            this.dataLoad = false;
          }
          if (!this.promoHeaders.length) {
            this.promoHeaders = res.result.data.headers;
            this.promoHeaders.push({
              format: '',
              key: 'chkboxx',
              name: '',
              type: 'text',
              updated: 0,
              width: 100
            });
            this.columnDefs = this.generateColumns(
              this.promoHeaders,
              'promotions'
            );
          }
          this.updatedColumns = res.result.data.updated_columns;
          // if (revData.length) {
          //   this.currentPromoData = revData[0];
          //   if (revData.length > 1) {
          //     this.revision1PromoData = revData[1];
          //   }
          //   if (revData.length > 2) {
          //     this.revision2PromoData = revData[2];
          //   }
          // }
          if (this.rowData.length) {
            this.currentPromoData = this.rowData[0];
          }
          if (revData.length) {
            this.revision1PromoData = revData[0];
            this.revision2PromoData = revData[1];
            this.columnDefsRev = this.generateColumns(
              this.promoHeaders,
              'revision'
            );
          } else {
            this.revision1PromoData = [];
            this.revision2PromoData = [];
          }
          setTimeout(() => {
            if (this.selectedRowsData.promotions.length) {
              let idx = _.findIndex(this.selectedRowsData.promotions, {
                promotion_id: this.activeModData.promotions[
                  this.selectedTabIndex
                ].id
              });
              if (
                idx > -1 &&
                this.selectedRowsData.promotions[idx].items.length &&
                this.gridApi
              ) {
                this.gridApi.forEachNode(node => {
                  let idx1 = this.selectedRowsData.promotions[
                    idx
                  ].items.indexOf(node.data.item_id);
                  if (idx1 > -1) {
                    node.setSelected(true);
                    node.setExpanded(true);
                  }
                });
              }
            }
          }, 200);
        });
    }
  }
  saveModData() {
    let params = {
      // introduction_copy_statement: this.activeModData
      //   .introduction_copy_statement
      //   ? this.activeModData.introduction_copy_statement
      //   : '',
      // mainline_copy_statement: this.activeModData.mainline_copy_statement
      //   ? this.activeModData.mainline_copy_statement
      //   : '',
      // descriptor_copy_statement: this.activeModData.descriptor_copy_statement
      //   ? this.activeModData.descriptor_copy_statement
      //   : '',
      // price: this.activeModData.price ? this.activeModData.price : '',
      // offer_type_id: this.selectedOfferType ? this.selectedOfferType : '',
      // //  buy_x: this.activeModData.buy_x,
      // //  get_x_free: this.activeModData.get_x_free,
      // //  coupon_amount: this.activeModData.coupon_amount,
      // //  limit_quantity: this.activeModData.limit_quantity,
      // //  limit_purchase_amount: this.activeModData.limit_purchase_amount,
      // variety: this.activeModData.variety,
      // unit: this.activeModData.unit,
      // // ea_or_lb: this.activeModData.ea_or_lb,
      // regular_price: this.activeModData.regular_price,
      // regular_qty: this.activeModData.regular_qty,
      // promo_price: this.activeModData.promo_price,
      // promo_qty: this.activeModData.promo_qty
      images: this.activeModData.images,
      logos: this.activeModData.logos,
      icons: this.activeModData.icons,
      id: this.activeModData.mod_id
    };
    const dummyJson = {};
    let i = 0;
    let myObj = {};
    this.editModForm.value.pricing_values.map(attr => {
      // if (i < this.pricingHeaders.length) {
      //  // Object.assign(params, attr);
      myObj[Object.keys(attr)[0]] = Object.values(attr)[0];
      // }
      // i++;
    });
    delete this.editModForm.value.pricing_values;
    Object.assign(params, { pricing_values: myObj });
    this.editModForm.value.offer_start_date = this.offerStartDdate;
    this.editModForm.value.offer_end_date = this.offerEndDate;
    //  if (i == this.pricingHeaders.length) {
    params = { ...params, ...this.editModForm.value };
    this.saveCall(params);
    // }
  }
  saveCall(params) {
    this.adsService.getAdModules([{ url: 'createMod' }, params]).then(res => {
      if (res.result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Mod Details Updated Successfully'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        setTimeout(() => {
          this.adsService.hideHeader = false;
          this.closeEdit.emit(event);
          //   this.dialogRef.close({ data: res });
        }, 1000);
      }
      this.enableSaveBtn = false;
    });
  }
  generateColumns(data: any[], from: any) {
    const columnDefinitions = [];
    this.allAutoSizeColumns = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['tooltipValueGetter'] = params => params.value;
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      if (data[i].key === 'chkboxx' && from == 'promotions') {
        temp['checkboxSelection'] = true;
        temp['headerCheckboxSelection'] = true;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['pinned'] = 'left';
        // if (data[i].type === 'number') {
        //   temp['cellEditor'] = 'numericEditor';
        // } else if (data[i].type === 'price') {
        //   temp['cellEditor'] = 'priceEditor';
        // }
      }
      if (data[i].key == 'sku_no' && from == 'promotions') {
        temp['cellClass'] = 'sku_no_class';
        temp['cellRenderer'] = params => {
          if (params.data) {
            return params.value
              ? `<span class="data">` +
                  params.value +
                  `</span><span class="icon"><i class="pixel-icons icon-search"></i></span>`
              : '';
          } else {
            return params.value;
          }
        };
      }
      this.allAutoSizeColumns.push(data[i].key);
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  onRowSelected(event) {
    let promoParams = {
      promotion_id: this.activeModData.promotions[this.selectedTabIndex].id,
      items: []
    };
    if (this.gridApi.getSelectedRows().length) {
      promoParams.items = _.map(this.gridApi.getSelectedRows(), 'item_id');
    }
    let idx = _.findIndex(this.selectedRowsData.promotions, {
      promotion_id: this.activeModData.promotions[this.selectedTabIndex].id
    });
    if (idx > -1) {
      if (promoParams.items.length) {
        this.selectedRowsData.promotions[idx].items = promoParams.items;
      } else {
        this.selectedRowsData.promotions.splice(idx, 1);
      }
    } else {
      if (this.gridApi.getSelectedRows().length) {
        this.selectedRowsData.promotions.push(promoParams);
      }
    }
  }

  getModData(event) {
    // local filtering with status, mod name
    this.filteredMods = event.modData.currentValue;
    // here comparing length for actual collection with filtering , to avoid always selection of  first element even selected the item
    if (this.filteredMods.length != this.selectedPageData.mod_details.length) {
      this.getActiveMod(this.filteredMods[0], '');
    }
  }
  valChanged() {
    this.enableSaveBtn = true;
  }
  changeKey(key) {
    this.enableSaveBtn = true;
    if (this.editModForm.value.crv == this.ca_crv.key) {
      this.editModForm.controls['crv'].patchValue('');
    } else {
      this.editModForm.controls['crv'].patchValue(this.ca_crv.key);
    }
  }
  splitMod() {
    this.updatingInfo = true;
    this.dialogRefSplitMod = this.dialog.open(SplitModComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog', 'split-mod-dialog'],
      width: '720px',
      data: {
        rowData: this.selectedRowsData,
        pagesInfo: this.data.pagesInfo,
        selectedRow: { ad_id: this.appService.adId },
        currentPageDetails: this.data.modData,
        mode: 'split-mod',
        activeMod: this.activeModData
      }
    });

    this.dialogRefSplitMod.afterClosed().subscribe(result => {
      if (result.from == 'close') {
        // this.close();
        this.updatingInfo = false;
        return;
      }
      let res = result.result.result;
      if (res.success && res.data) {
        // this.refreshData = true;
        // let params = {
        //   ad_id: this.appService.adId,
        //   id: res.data.page_id
        // };
        // this.adsService
        //   .getAdModules([{ url: 'getPageInfo' }, params])
        //   .then(res => {
        //     this.selectedPageData = res.result.data;
        //     this.selectedPageData.mod_details.map(x => {
        //       x['mod_orderName'] = 'mod ' + x['mod_order'];
        //       x['statusName'] = x['status'] == 1 ? 'Pending' : 'Completed';
        //     });
        //   });
        if (res.data.mod_details.length) {
          let idx = _.findIndex(this.selectedPageData.mod_details, {
            mod_id: res.data.mod_details[0].mod_id
          });
          if (idx > -1) {
            this.selectedPageData.mod_details[idx] = res.data.mod_details[0];
            this.selectedPageData.mod_details.map(x => {
              x['mod_orderName'] = 'mod ' + x['mod_order'];
              x['statusName'] = x['status'] == 1 ? 'Pending' : 'Completed';
            });
            if (result.from != 'split-mod') {
              this.updatingInfo = false;
              this.selectedTabIndex =
                this.selectedPageData.mod_details[idx].promotions.length - 1;
            } else {
              // getting selected mod promotions again from the DB... for latest data refresh
              let params = {
                ad_id: this.appService.adId,
                id: this.selectedPage
              };
              this.adsService
                .getAdModules([{ url: 'getPageInfo' }, params])
                .then(res => {
                  this.selectedPageData = res.result.data;
                  this.selectedPageData.mod_details.map(x => {
                    x['mod_orderName'] = 'mod ' + x['mod_order'];
                    x['statusName'] =
                      x['status'] == 1 ? 'Pending' : 'Completed';
                  });
                  this.updatingInfo = false;
                });
            }
            this.getActiveMod(this.selectedPageData.mod_details[idx], 'split');
            this.selectedRowsData.promotions = [];
          } else {
            this.updatingInfo = false;
          }
        }
        this.refreshData = false;
      }
    });
  }

  showAllModImages(from) {
    this.dialogRef2 = this.dialog.open(ImageAssestsComponent, {
      panelClass: ['campaign-dialog', 'overlay-dialog'],
      width: '680px',
      data: {
        title: 'Edit Images',
        rowData: [],
        url: '',
        from: from,
        action: 'editModImages',
        fromComp: 'editMod',
        activeModData: this.activeModData
      }
    });
    this.dialogRef2.afterClosed().subscribe(res => {
      if (res.length == 0) {
        return;
      }
      if (res && res.data.assetType === 'images') {
        this.activeModData.images = res.data.selectedAssets;
        this.activeModData.images = _.unionBy(
          this.activeModData.images,
          'assetId'
        );
        this.enableSaveBtn = true;
      }
      if (res && res.data.assetType === 'icon_path') {
        this.activeModData.icons = res.data.selectedAssets;
        this.activeModData.icons = _.unionBy(
          this.activeModData.icons,
          'assetId'
        );
        this.enableSaveBtn = true;
      }
    });
  }
  getPricingData(offerType, from) {
    this.activeModData['is_delete'];
    let length = this.pricing_values.length;
    if (this.pricing_values.length) {
      for (let i = 0; i < length; i++) {
        this.pricing_values.removeAt(0);
      }
    }
    let params = {
      offer_type_id: offerType,
      mod_id: this.selectedModId
        ? this.selectedModId
        : this.activeModData.mod_id,
      ad_id: this.appService.adId
    };
    this.adsService
      .getAdModules([{ url: 'getPricingData' }, params])
      .then(res => {
        this.pricingValues = res.result.data.pricing[0].pricing_values;
        this.pricingHeaders = res.result.data.pricingHeaders;
        this.pricingHeaders.forEach(pH => {
          if (pH.type == 'checkboxes') {
            pH.options.forEach(pHO => {
              pHO.type = 'checkboxes';
              pHO.checked = this.pricingValues[pHO.key];
            });
            this.pricingHeaders.push(...pH.options);
          }
        });
        // console.log(this.pricingHeaders);
        // if(from != 'change'){
        this.pricingHeaders.push({
          name: 'Dept Callout',
          key: 'dept_callout',
          type: 'dropDown',
          options: [
            {
              id: 'In Our Deli',
              name: 'In Our Deli'
            },
            {
              id: 'In Our Bakery',
              name: 'In Our Bakery'
            }
          ]
        });
        // }
        this.pricingData = res.result.data.pricing.length
          ? res.result.data.pricing[0]
          : res.result.data.pricing;
        this.editModForm.controls['offer_start_date'].patchValue(
          moment(this.pricingData['offer_start_date'])['_d']
        );
        this.editModForm.controls['offer_end_date'].patchValue(
          moment(this.pricingData['offer_end_date'])['_d']
        );

        if (this.pricingData['offer_start_date']) {
          if (
            moment(this.pricingData['offer_start_date']).diff(
              moment(new Date()),
              'days'
            ) >= 0
          ) {
            this.minEndDate = moment(this.pricingData['offer_start_date']).add(
              0,
              'days'
            )['_d'];
          }
        }
        if (this.pricingData['offer_end_date']) {
          // if (moment(this.activeModData['offer_end_date']).diff(moment(new Date()), 'days') >= 0) {
          this.maxStrtDate = moment(this.pricingData['offer_end_date']).add(
            0,
            'days'
          )['_d'];
          // }
        }
        if (this.pricingHeaders.length) {
          if (this.pricing_values.length) {
            for (let i = 0; i < length; i++) {
              this.pricing_values.removeAt(0);
            }
          }
          // this.editModForm['pricing_values'] = this.fb.array([]);
          this.createControls();
          setTimeout(() => {
            this.subscribeValChanges();
          }, 2000);
        }
      });
  }
  public get pricing_values() {
    return this.editModForm.get('pricing_values') as FormArray;
  }
  subscribeValChanges() {
    let formArray = this.editModForm.get('pricing_values') as FormArray;
    // console.log(formArray);
    // console.log(this.pricingHeaders)
    this.pricingHeaders.forEach(attr => {
      if (attr.type == 'price') {
        formArray.controls.map(row => {
          if (row['controls'][attr.key]) {
            row['controls'][attr.key].valueChanges.subscribe(selectedValue1 => {
              setTimeout(() => {
                if (selectedValue1 && selectedValue1 != '') {
                  if (selectedValue1.match(/^\d*\.?\d{0,2}$/g)) {
                    row['controls'][attr.key].setValue(selectedValue1, {
                      emitEvent: false
                    });
                  } else {
                    if (parseFloat(selectedValue1)) {
                      let selVal = selectedValue1.toString();
                      selVal = selVal.slice(
                        0,
                        selectedValue1.split('.')[0].length + 3
                      );
                      selVal = parseFloat(selVal);
                      row['controls'][attr.key].setValue(selVal, {
                        emitEvent: false
                      });
                    } else {
                      row['controls'][attr.key].setValue('', {
                        emitEvent: false
                      });
                    }
                  }
                }
              });
            });
          }
        });
      }
      if (attr.type == 'number') {
        formArray.controls.map(row => {
          if (row['controls'][attr.key]) {
            row['controls'][attr.key].valueChanges.subscribe(selectedValue2 => {
              setTimeout(() => {
                if (selectedValue2 && selectedValue2 != '') {
                  if (selectedValue2.match(/^\d*$/g)) {
                    row['controls'][attr.key].setValue(selectedValue2, {
                      emitEvent: false
                    });
                  } else {
                    if (parseInt(selectedValue2)) {
                      row['controls'][attr.key].setValue(
                        parseInt(selectedValue2),
                        { emitEvent: false }
                      );
                    } else {
                      row['controls'][attr.key].setValue('', {
                        emitEvent: false
                      });
                    }
                  }
                }
              });
            });
          }
        });
      }
    });
    // this.pricingHeaders.forEach(attr => {
    //   if(attr.type == "price"){
    // this.editModForm.controls['pricing_values'].controls[0].controls['regular_price'].valueChanges.subscribe(selectedValue1 => {
    //   setTimeout(() => {
    //     if (selectedValue1 && selectedValue1 != '') {
    //       if (selectedValue1.match(/^\d*\.?\d{0,2}$/g)) {
    //         this.editModForm.controls['pricing_values'].controls[0].controls['regular_price'].setValue(selectedValue1, {
    //           emitEvent: false
    //         });
    //       } else {
    //         if (parseFloat(selectedValue1)) {
    //           this.editModForm.controls['pricing_values'].controls[0].controls['regular_price'].setValue(
    //             parseFloat(selectedValue1).toFixed(2),
    //             { emitEvent: false }
    //           );
    //         } else {
    //           this.editModForm.controls['pricing_values'].controls[0].controls['regular_price'].setValue('', {
    //             emitEvent: false
    //           });
    //         }
    //       }
    //     }
    //   }, 50);
    // });
    // }
    //   console.log(attr,this.editModForm.controls);
    // })
  }
  createControls() {
    this.pricingHeaders.forEach(attr => {
      if (this.pricing_values.length < this.pricingHeaders.length) {
        this.pricing_values.push(this.createFormGroup(attr));
      }
    });
    this.formReady = true;
  }
  createFormGroup(attr) {
    if (attr.key == 'dept_callout') {
      return this.fb.group({
        [attr.key]: this.pricingData['pricing_values'][attr.key]
          ? this.pricingData['pricing_values'][attr.key]
          : ''
      });
      // return this.fb.group({
      //   [attr.key]: this.activeModData['dept_callout']
      //     ? this.activeModData['dept_callout']
      //     : ''
      // });
    } else {
      if (attr.type == 'multiple_choice') {
        return this.fb.group({
          [attr.key]: this.pricingData['pricing_values'][attr.key]
            ? [this.pricingData['pricing_values'][attr.key]]
            : ''
        });
      } else if (attr.type == 'checkboxes') {
        return this.fb.group({
          [attr.key]: this.pricingData['pricing_values'][attr.key]
            ? this.pricingData['pricing_values'][attr.key]
            : false
        });
      } else {
        return this.fb.group({
          [attr.key]: this.pricingData['pricing_values'][attr.key]
            ? this.pricingData['pricing_values'][attr.key]
            : ''
        });
      }
    }
  }
  chkBoxChnged(evnt) {
    let i = 0;
    this.enableSaveBtn = true;
    this.pricing_values.value.forEach((k, v) => {
      if (Object.keys(k)[0] === evnt) {
        this.pricing_values.value[i][evnt] = !this.pricing_values.value[i][
          evnt
        ];
      }
      i++;
    });
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  dateValueChange(key, ev) {
    this.enableSaveBtn = true;
    if (key == 'offer_start_date') {
      this.minEndDate = moment(ev.value).add(0, 'days')['_d'];
      this.offerStartDdate = moment(ev.value).format('MM/DD/YYYY');
    } else if (key == 'offer_end_date') {
      // if (moment(this.activeModData['offer_end_date']).diff(moment(new Date()), 'days') >= 0) {
      this.maxStrtDate = this.minEndDate = moment(ev.value).add(0, 'days')[
        '_d'
      ];
      this.offerEndDate = moment(ev.value).format('MM/DD/YYYY');

      // }
    }
  }
  deletePreviewItems(from, mode, action, selectedItem) {
    if (action == 'deltePreviewItems') {
      if (from == 'image') {
        if (this.activeModData.images.length) {
          const idx = _.findIndex(this.activeModData.images, {
            assetId: selectedItem.assetId
          });
          if (idx >= 0) {
            this.activeModData.images.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      }
      if (from == 'logo') {
        if (this.activeModData.logos.length) {
          const idx = _.findIndex(this.activeModData.logos, {
            assetId: selectedItem.assetId
          });
          if (idx >= 0) {
            this.activeModData.logos.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      }
      if (from == 'icon') {
        if (this.activeModData.icons.length) {
          const idx = _.findIndex(this.activeModData.icons, {
            icon_id: selectedItem.icon_id
          });
          if (idx >= 0) {
            this.activeModData.icons.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      }
    }
  }
  //   public copyValue = '';
  //   selectCell(value){
  //     // console.log(value);
  //     this.copyValue = value;
  //   }

  //   onKeyPress($event: KeyboardEvent) {
  //     if(($event.ctrlKey || $event.metaKey) && $event.keyCode == 67){
  //        console.log(this.copyValue);
  //     }

  // }

  // private bindKeypressEvent(): Observable<KeyboardEvent> {
  //     const eventsType$ = [
  //         fromEvent(window, 'keypress'),
  //         fromEvent(window, 'keydown')
  //     ];
  //     // we merge all kind of event as one observable.
  //     return merge(...eventsType$)
  //         .pipe(
  //             // We prevent multiple next by wait 10ms before to next value.
  //             debounce(() => timer(10)),
  //             // We map answer to KeyboardEvent, typescript strong typing...
  //             map(state => (state as KeyboardEvent))
  //         );
  // }
}

import { Directive, HostListener, ElementRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { SplitModComponent } from '../split-mod/split-mod.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CustomValidation } from '@app/shared/utility/custom-validations';
import * as moment from 'moment';
import { debug } from 'util';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  private regex: RegExp = new RegExp(/^-?[0-9]+(\[0-9]*){0,1}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab'];

  constructor(private el: ElementRef) {}
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
@Directive({
  selector: '[appPriceOnly]'
})
export class PriceOnlyDirective {
  // private regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'Control'];

  constructor(private el: ElementRef) {}
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
@Directive({
  selector: '[ngInit]'
})
export class NgInitDirective implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.ngInit.emit(changes);
  }

  @Input() modData;

  @Output()
  ngInit: EventEmitter<any> = new EventEmitter();

  ngOnInit() {}
}

@Directive({
  selector: '[appBlockCopyPaste]'
})
export class BlockCopyPasteDirective {
  constructor() {}

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  // @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
  //   e.preventDefault();
  // }
}

@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    '-',
    'ArrowLeft',
    'ArrowRight',
    'Del',
    'Delete'
  ];

  constructor(private el: ElementRef) {}
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position)
    ].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}

@Directive({
  selector: '[numeric]'
})
export class NumericDirective {
  @Input('decimals') decimals: number = 0;

  private check(value: string, decimals: number) {
    if (decimals <= 0) {
      return String(value).match(new RegExp(/^\d+$/));
    } else {
      var regExpString =
        '^\\s*((\\d+(\\.\\d{0,' +
        decimals +
        '})?)|((\\d*(\\.\\d{1,' +
        decimals +
        '}))))\\s*$';
      return String(value).match(new RegExp(regExpString));
    }
  }

  private specialKeys = [
    'Backspace',
    'Tab',
    'End',
    'Home',
    'ArrowLeft',
    'ArrowRight',
    'Delete'
  ];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !this.check(next, this.decimals)) {
      event.preventDefault();
    }
  }
}

@Pipe({ name: 'modFilter' })
export class ModFilterPipe implements PipeTransform {
  transform(items: any, filter: any, isAnd: boolean): any {
    if (filter && Array.isArray(items)) {
      let filterKeys = Object.keys(filter);
      var filteredItems = items.filter(item => {
        return filterKeys.some(keyName => {
          return (
            new RegExp(filter[keyName], 'gi').test(item[keyName]) ||
            filter[keyName] === ''
          );
        });
      });
      return filteredItems;
    } else {
      return items;
    }
  }
}
