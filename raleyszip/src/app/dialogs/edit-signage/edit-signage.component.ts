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
  OnDestroy
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
import { trigger, transition, style, animate } from '@angular/animations';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { SplitModComponent } from '../split-mod/split-mod.component';
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
import * as moment from 'moment';
import { map, startWith, timeout } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CreatePromotionsComponent } from '../create-promotions/create-promotions.component';
import { CreateSignageComponent } from '../create-signage/create-signage.component';
const APP: any = window['APP'];

export interface User {
  name: string;
}
export interface Headline {
  name: string;
}

@Component({
  selector: 'app-edit-signage',
  templateUrl: './edit-signage.component.html',
  styleUrls: ['../edit-mod/edit-mod.component.scss'],
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
export class EditSignageComponent implements OnInit, OnDestroy {
  @ViewChild('rev1Panel') rev1Panel: MatExpansionPanel;
  @ViewChild('rev2Panel') rev2Panel: MatExpansionPanel;
  @Input('editModInputData') data: any;
  @Output() closeEdit: EventEmitter<any> = new EventEmitter();
  offerTypeArray = [];
  offerTypeInactive = [];
  crvArray = [];
  uomArray = [];
  selectedPageData: any;
  activeModData: any;
  range: Range = { fromDate: new Date(), toDate: new Date() };
  rangeOptions: NgxDrpOptions;
  presets: Array<PresetItem> = [];

  public offerUnits: any;
  public submitted: boolean = false;
  public offerVarieties: any;
  public previousSignagePromotionId: any;
  public currentPromoData = [];
  public revision1PromoData = [];
  public revision2PromoData = [];
  public promoHeaders = [];
  public signCreativeArray = [];
  public headerCreativeArray = [];
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
  public indxValue;
  public header_id;

  public selectedRowsData = {
    // page_id: '',
    signage_id: '',
    promotions: []
  };
  public noData: any;
  public noModDetails: any;
  public searchWord: any;
  public editModForm: FormGroup;
  public leftSliderValue = false;
  public unitOptions = [{ id: 'EA', name: 'EA' }, { id: 'LB', name: 'LB' }];
  public currentHeader = '';
  public headlinesListOptions: any;
  public underlineListOptions: any;
  public emptySignIndex;

  ///////////////

  public updatingInfo = false;
  public pricingHeaders = [];
  public pricingData = [];
  public pricingValues: any;
  // pricing_values = [];
  public formReady = false;
  public minStrtDate = moment(new Date()).add(0, 'days')['_d'];
  public maxStrtDate = '';
  public minEndDate = moment(new Date()).add(0, 'days')['_d'];
  public maxEndDate = '';
  public showAddPromBtn = false;
  public dialogRef: any;
  public deptId;

  public deptList = [];
  public dpt_id;
  public isBlank = false;
  public reg_retail_Obj: any;
  public reg_retail_Obj2: any;
  public reg_retail_Obj3: any;
  public reg_retail_Obj4: any;
  public reg_retail_Obj5: any;

  public bmsm_price: any;
  public bmsm_qty: any;
  public promo_price: any;
  public promo_qty: any;
  public regular_price: any;
  public regular_qty: any;
  public buy_x: any;
  public get_x: any;
  public get_item: any;
  public limit_quantity: any;
  public save_amount: any;

  public cloneDept;
  public offerName;
  public promoId;
  public limitQty;
  public qty;
  public qty_3x8;
  public qty_5x3_5;
  public qty_7x11;
  public showDateValidation = false;
  public saveCopyOptions = [
    { id: 'save', name: 'Save' },
    { id: 'Save up to', name: 'Save Up to' }
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
    // console.log(this.data);
    // console.log(this.data.index);
    // this.indxValue = this.data.index;

    this.leftSliderValue = false;
    this.leftSlider('init');
    this.getSignCreatives();
    this.getOfferForms();
    this.copyPasteFeature();
    // this.appService.getForms().then(data => {
    //   this.offerTypeArray = data.result.data.data;
    // });
    // this.getUnitVarieties();

    this.reg_retail_Obj = this.editModForm.controls[
      'reg_retail'
    ].valueChanges.subscribe(selectedValue1 => {
      setTimeout(() => {
        if (selectedValue1 && selectedValue1 != '') {
          // console.log(selectedValue1)
          if (String(selectedValue1).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['reg_retail'].setValue(selectedValue1, {
              emitEvent: false
            });
          } else {
            if (parseFloat(selectedValue1)) {
              let selVal = selectedValue1.toString();
              selVal = selVal.slice(0, selectedValue1.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['reg_retail'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['reg_retail'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.reg_retail_Obj2 = this.editModForm.controls[
      'sale_price'
    ].valueChanges.subscribe(selectedValue2 => {
      setTimeout(() => {
        if (selectedValue2 && selectedValue2 != '') {
          if (String(selectedValue2).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['sale_price'].setValue(selectedValue2, {
              emitEvent: false
            });
          } else {
            if (parseFloat(selectedValue2)) {
              let selVal = selectedValue2.toString();
              selVal = selVal.slice(0, selectedValue2.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['sale_price'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['sale_price'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });
    this.reg_retail_Obj3 = this.editModForm.controls[
      'single_item_price'
    ].valueChanges.subscribe(selectedValue3 => {
      setTimeout(() => {
        if (selectedValue3 && selectedValue3 != '') {
          if (String(selectedValue3).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['single_item_price'].setValue(
              selectedValue3,
              { emitEvent: false }
            );
          } else {
            if (parseFloat(selectedValue3)) {
              let selVal = selectedValue3.toString();
              selVal = selVal.slice(0, selectedValue3.split('.')[0].length + 3);
              selVal = parseFloat(selVal);
              this.editModForm.controls['single_item_price'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['single_item_price'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.reg_retail_Obj4 = this.editModForm.controls[
      'quantity'
    ].valueChanges.subscribe(selectedValue4 => {
      setTimeout(() => {
        if (selectedValue4 && selectedValue4 != '') {
          if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue4)
            this.editModForm.controls['quantity'].setValue(selectedValue4, {
              emitEvent: false
            });
          } else {
            if (parseInt(selectedValue4)) {
              // console.log(selectedValue4)

              this.editModForm.controls['quantity'].setValue(
                parseInt(selectedValue4),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue4)

              this.editModForm.controls['quantity'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.reg_retail_Obj5 = this.editModForm.controls[
      'limit'
    ].valueChanges.subscribe(selectedValue5 => {
      setTimeout(() => {
        if (selectedValue5 && selectedValue5 != '') {
          if (String(selectedValue5).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue5)
            this.editModForm.controls['limit'].setValue(selectedValue5, {
              emitEvent: false
            });
          } else {
            if (parseInt(selectedValue5)) {
              // console.log(selectedValue5)

              this.editModForm.controls['limit'].setValue(
                parseInt(selectedValue5),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue5)

              this.editModForm.controls['limit'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.getDepartmnetsList();
    this.rangeOptions = {
      presets: this.presets,
      format: 'mediumDate',
      range: { fromDate: new Date(), toDate: new Date() },
      applyLabel: 'Submit',
      placeholder: ''
    };
    this.headerCreativeArray = _.cloneDeep(this.data.headerCreativeArray);
    this.crvArray = [{ id: 'yes', name: 'Yes' }, { id: 'no', name: 'No' }];
    this.uomArray = [{ id: 'ea', name: 'EA' }, { id: 'lb', name: 'LB' }];
    this.selectedPageData = _.cloneDeep(this.data.totalSignages);
    this.activeModData = _.cloneDeep(this.data.selctedSignage);
    if (this.data.from == 'emptySign') {
      // let index = this.selectedPageData.length - 1;
      this.emptySignIndex = 0;

      // console.log(this.emptySignIndex);

      this.getActiveMod(
        this.selectedPageData[this.emptySignIndex],
        ' ',
        this.emptySignIndex
      );
      this.selectedPageData = this.data.totalSignages;

      this.showAddPromBtn = true;
    }
    let headerIdx = _.findIndex(this.headerCreativeArray, {
      id: this.activeModData['header_id'] ? this.activeModData['header_id'] : ''
    });
    this.currentHeader =
      headerIdx > -1 ? this.headerCreativeArray[headerIdx].name : '';
    if (this.editModForm) {
      this.editModForm.patchValue(this.activeModData);
      // if (this.editModForm.value.from_date) {
      //   this.editModForm.value['from_to_date'].startDate = new Date(
      //     this.editModForm.value.from_date
      //   );
      // }
      // if (this.editModForm.value.to_date) {
      //   this.editModForm['from_to_date'].endDate = new Date(
      //     this.editModForm.value.to_date
      //   );
      // }
      if (this.activeModData.from_date && this.activeModData.to_date) {
        this.editModForm.controls['from_to_date'].setValue({
          startDate: moment(this.activeModData.from_date),
          endDate: moment(this.activeModData.to_date)
        });
      } else {
        this.editModForm.controls['from_to_date'].setValue('');
      }

      this.enableSaveBtn = false;
    }

    this.selectedPage = this.data.selctedSignage;
    // console.log(this.selectedPageData)
    // console.log(this.indxValue)

    this.selectedRowsData.signage_id = this.activeModData.signage_id;
    // this.selectedRowsData.page_id = this.selectedPageData.page_id;
    this.selectedOfferType = this.activeModData['offer_type_id']
      ? this.activeModData['offer_type_id']
      : '';

    //  console.log(this.activeModData, 'rrrrrrrrrrrrrr')

    this.selectedPageData.map(x => {
      x['signageName'] = 'sign ' + x['signage_number'];
      x['statusName'] = x['status'] == 1 ? 'Pending' : 'Completed';
    });
    this.getActiveMod(
      this.activeModData,
      'init',
      this.selectedPage.signage_number - 1
    );
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

    this.editModForm.valueChanges.subscribe(data => {
      // console.log(data);
      // if (data.from_to_date != '') {
      //   this.enableSaveBtn = true;
      // }
      // if (this.editModForm.valid) {
      //   this.enableSaveBtn = true;
      // } else {
      //   this.enableSaveBtn = false;
      // }

      // this.enableSaveBtn = true;

      // let oldData = {
      //   headline: this.activeModData.headline,
      //   header_id :this.activeModData.header_id,
      //   re-rea
      // }

      // console.log(data);
      // this.activeModData.headline = data.headline;
      // this.activeModData.underline = data.underline;
      // this.activeModData.header_id = data.header_id;
      // this.activeModData.reg_retail = data.reg_retail;
      // this.activeModData.uom = data.uom;
      // console.log(this.offerTypeArray);

      this.offerTypeArray.forEach(offer => {
        if (offer.id == data.offer_type_id) {
          // console.log(this.offerTypeArray);

          this.offerName = offer.name;
        }
      });

      this.activeModData.offer_type_name = this.offerName;

      // this.activeModData.offer_type_name = data.offer_type_id;

      let headerIdx = _.findIndex(this.headerCreativeArray, {
        id: data.header_id ? data.header_id : ''
      });
      this.currentHeader =
        headerIdx > -1 ? this.headerCreativeArray[headerIdx].name : '';
    });

    this.editModForm.get('headline').valueChanges.subscribe(val => {
      this.searchSignageInfo({
        signage_id: this.activeModData.signage_id,
        search: val,
        filter: 'headline'
      });
    });

    this.editModForm.get('underline').valueChanges.subscribe(val => {
      this.searchSignageInfo({
        signage_id: this.activeModData.signage_id,
        search: val,
        filter: 'underline'
      });
    });
  }

  copyPasteFeature() {
    this.bmsm_price = this.editModForm.controls[
      'bmsm_price'
    ].valueChanges.subscribe(selectedValue1 => {
      setTimeout(() => {
        if (selectedValue1 && selectedValue1 != '') {
          // console.log(selectedValue1)
          if (String(selectedValue1).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['bmsm_price'].setValue(selectedValue1, {
              emitEvent: false
            });
          } else {
            if (parseFloat(selectedValue1)) {
              let selVal = selectedValue1.toString();
              selVal = selVal.slice(0, selectedValue1.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['bmsm_price'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['bmsm_price'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.promo_price = this.editModForm.controls[
      'promo_price'
    ].valueChanges.subscribe(selectedValue1 => {
      setTimeout(() => {
        if (selectedValue1 && selectedValue1 != '') {
          // console.log(selectedValue1)
          if (String(selectedValue1).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['promo_price'].setValue(selectedValue1, {
              emitEvent: false
            });
          } else {
            if (parseFloat(selectedValue1)) {
              let selVal = selectedValue1.toString();
              selVal = selVal.slice(0, selectedValue1.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['promo_price'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['promo_price'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.regular_price = this.editModForm.controls[
      'regular_price'
    ].valueChanges.subscribe(selectedValue1 => {
      setTimeout(() => {
        if (selectedValue1 && selectedValue1 != '') {
          // console.log(selectedValue1)
          if (String(selectedValue1).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['regular_price'].setValue(
              selectedValue1,
              {
                emitEvent: false
              }
            );
          } else {
            if (parseFloat(selectedValue1)) {
              let selVal = selectedValue1.toString();
              selVal = selVal.slice(0, selectedValue1.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['regular_price'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['regular_price'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.bmsm_qty = this.editModForm.controls[
      'bmsm_qty'
    ].valueChanges.subscribe(selectedValue4 => {
      setTimeout(() => {
        if (selectedValue4 && selectedValue4 != '') {
          if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue4)
            this.editModForm.controls['bmsm_qty'].setValue(selectedValue4, {
              emitEvent: false
            });
          } else {
            if (parseInt(selectedValue4)) {
              // console.log(selectedValue4)

              this.editModForm.controls['bmsm_qty'].setValue(
                parseInt(selectedValue4),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue4)

              this.editModForm.controls['bmsm_qty'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.promo_qty = this.editModForm.controls[
      'promo_qty'
    ].valueChanges.subscribe(selectedValue4 => {
      setTimeout(() => {
        if (selectedValue4 && selectedValue4 != '') {
          if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue4)
            this.editModForm.controls['promo_qty'].setValue(selectedValue4, {
              emitEvent: false
            });
          } else {
            if (parseInt(selectedValue4)) {
              // console.log(selectedValue4)

              this.editModForm.controls['promo_qty'].setValue(
                parseInt(selectedValue4),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue4)

              this.editModForm.controls['promo_qty'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.regular_qty = this.editModForm.controls[
      'regular_qty'
    ].valueChanges.subscribe(selectedValue4 => {
      setTimeout(() => {
        if (selectedValue4 && selectedValue4 != '') {
          if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue4)
            this.editModForm.controls['regular_qty'].setValue(selectedValue4, {
              emitEvent: false
            });
          } else {
            if (parseInt(selectedValue4)) {
              // console.log(selectedValue4)

              this.editModForm.controls['regular_qty'].setValue(
                parseInt(selectedValue4),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue4)

              this.editModForm.controls['regular_qty'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.buy_x = this.editModForm.controls['buy_x'].valueChanges.subscribe(
      selectedValue4 => {
        setTimeout(() => {
          if (selectedValue4 && selectedValue4 != '') {
            if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
              // console.log(selectedValue4)
              this.editModForm.controls['buy_x'].setValue(selectedValue4, {
                emitEvent: false
              });
            } else {
              if (parseInt(selectedValue4)) {
                // console.log(selectedValue4)

                this.editModForm.controls['buy_x'].setValue(
                  parseInt(selectedValue4),
                  { emitEvent: false }
                );
              } else {
                // console.log(selectedValue4)

                this.editModForm.controls['buy_x'].setValue('', {
                  emitEvent: false
                });
              }
            }
          }
        }, 50);
      }
    );

    this.get_x = this.editModForm.controls['get_x'].valueChanges.subscribe(
      selectedValue4 => {
        setTimeout(() => {
          if (selectedValue4 && selectedValue4 != '') {
            if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
              // console.log(selectedValue4)
              this.editModForm.controls['get_x'].setValue(selectedValue4, {
                emitEvent: false
              });
            } else {
              if (parseInt(selectedValue4)) {
                // console.log(selectedValue4)

                this.editModForm.controls['get_x'].setValue(
                  parseInt(selectedValue4),
                  { emitEvent: false }
                );
              } else {
                // console.log(selectedValue4)

                this.editModForm.controls['get_x'].setValue('', {
                  emitEvent: false
                });
              }
            }
          }
        }, 50);
      }
    );

    // this.get_item = this.editModForm.controls[
    //   'get_item'
    // ].valueChanges.subscribe(selectedValue4 => {
    //   setTimeout(() => {
    //     if (selectedValue4 && selectedValue4 != '') {
    //       if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
    //         // console.log(selectedValue4)
    //         this.editModForm.controls['get_item'].setValue(selectedValue4, {
    //           emitEvent: false
    //         });
    //       } else {
    //         if (parseInt(selectedValue4)) {
    //           // console.log(selectedValue4)

    //           this.editModForm.controls['get_item'].setValue(
    //             parseInt(selectedValue4),
    //             { emitEvent: false }
    //           );
    //         } else {
    //           // console.log(selectedValue4)

    //           this.editModForm.controls['get_item'].setValue('', {
    //             emitEvent: false
    //           });
    //         }
    //       }
    //     }
    //   }, 50);
    // });

    this.limit_quantity = this.editModForm.controls[
      'limit_quantity'
    ].valueChanges.subscribe(selectedValue4 => {
      setTimeout(() => {
        if (selectedValue4 && selectedValue4 != '') {
          if (String(selectedValue4).match(/^(\d{1,9}|\d{0,100})$/)) {
            // console.log(selectedValue4)
            this.editModForm.controls['limit_quantity'].setValue(
              selectedValue4,
              {
                emitEvent: false
              }
            );
          } else {
            if (parseInt(selectedValue4)) {
              // console.log(selectedValue4)

              this.editModForm.controls['limit_quantity'].setValue(
                parseInt(selectedValue4),
                { emitEvent: false }
              );
            } else {
              // console.log(selectedValue4)

              this.editModForm.controls['limit_quantity'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });

    this.save_amount = this.editModForm.controls[
      'save_amount'
    ].valueChanges.subscribe(selectedValue1 => {
      setTimeout(() => {
        if (selectedValue1 && selectedValue1 != '') {
          // console.log(selectedValue1)
          if (String(selectedValue1).match(/^\d*\.?\d{0,2}$/g)) {
            this.editModForm.controls['save_amount'].setValue(selectedValue1, {
              emitEvent: false
            });
          } else {
            if (parseFloat(selectedValue1)) {
              let selVal = selectedValue1.toString();
              selVal = selVal.slice(0, selectedValue1.split('.')[0].length + 3);
              selVal = parseFloat(selVal);

              this.editModForm.controls['save_amount'].setValue(selVal, {
                emitEvent: false
              });
            } else {
              this.editModForm.controls['save_amount'].setValue('', {
                emitEvent: false
              });
            }
          }
        }
      }, 50);
    });
  }
  dateValueChange(event) {
    if (event) {
      this.enableSaveBtn = true;
      this.showDateValidation = false;
    }
  }

  searchSignageInfo(params) {
    this.adsService
      .getAdModules([{ url: 'searchSignageInfo' }, params])
      .then(res => {
        if (res.result.success) {
          if (params.filter == 'headline') {
            this.headlinesListOptions = res.result.data;
          }
          if (params.filter == 'underline') {
            this.underlineListOptions = res.result.data;
          }
        }
      });
  }

  getDepartmnetsList() {
    this.adsService
      .getAdModules([
        { url: 'getDepartments' },
        {
          column: '',
          pageNumber: 1,
          pageSize: 21,
          search: '',
          sort: 'asc'
        }
      ])
      .then(res => {
        if (res.result.success && res.result.data.data.length) {
          this.deptList = res.result.data.data;
          this.deptList.unshift({
            dept_code: 0,
            id: 'ALL',
            last_modified: 'Dec 20, 2019 12:30 PM',
            name: 'ALL',
            status: 1
          });
        }
      });
  }
  openAddPromo(from) {
    // console.log(this.dpt_id)
    //  console.log(this.data.index)

    this.dialogRef = this.dialog.open(CreateSignageComponent, {
      panelClass: ['overlay-dialog'],
      width: '850px',
      data: {
        title: 'Create Signage',
        deptList: this.deptList,
        deptId: this.dpt_id,
        signId: this.selectedModId,
        blankVal: this.isBlank,
        selectedDepartment: this.data.selctedSignage.dept_group,
        from: from,
        totalSignages: this.selectedPageData,
        index: this.data.index
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      // console.log(result)
      if (result && result.success) {
        // this.getList();

        this.indxValue = result.index;
        this.getPromotionRevision();
        // console.log( result.promoId)

        // this.promoId = result.promoId;

        // console.log(this.promoId)

        let params = {
          ad_id: this.appService.adId
        };
        this.adsService
          .getAdModules([{ url: 'getSignage' }, params])
          .then(res => {
            // console.log(res);

            if (res.result.success) {
              // console.log(this.indxValue)
              // console.log(this.emptySignIndex)

              this.activeModData = res.result.data[this.indxValue];
              this.editModForm.patchValue(this.activeModData);
              this.enableSaveBtn = false;

              // console.log(this.activeModData)
            }
          });
        // this.editModForm.value.reg_retail = result.res.result.data.data.reg_retail;
        // console.log(this.editModForm.value);
      }
      // if (result) {
      //   this.snackbar.openFromComponent(SnackbarComponent, {
      //     data: {
      //       status: 'success',
      //       msg: ' Signage Created Successfully'
      //     },
      //     verticalPosition: 'top',
      //     horizontalPosition: 'right'
      //   });
      // }
    });
  }

  valChanged(fieldname) {
    // console.log(event.target.value)
    // let a = event.target.value;
    // let b = [];
    // b = a.split('.');
    // console.log(b)

    this.enableSaveBtn = true;
    if (fieldname == 'headline') {
      this.activeModData.headline = this.editModForm.value.headline;
      // this.activeModData.underline = data.underline;
      // this.activeModData.header_id = data.header_id;
      // this.activeModData.reg_retail = data.reg_retail;
      // this.activeModData.uom = data.uom;
    } else if (fieldname == 'underline') {
      this.activeModData.underline = this.editModForm.value.underline;
    } else if (fieldname == 'reg_retail') {
      this.activeModData.reg_retail = this.editModForm.value.reg_retail;
    } else if (fieldname == 'bmsm_price') {
      this.activeModData.bmsm_price = this.editModForm.value.bmsm_price;
    }
  }

  valChangedQty(event, qtyField) {
    this.enableSaveBtn = true;
    // console.log(qtyField);

    if (qtyField == 'quantity') {
      this.qty = event.target.value;
      // event.target.value = event.target.value.replace(/[^0-9]*/g, '');

      // if(this.editModForm.controls['quantity'].hasError('pattern')) {
      //   this.enableSaveBtn = false;
      // }
    }

    if (qtyField == 'qty_3x8') {
      this.qty_3x8 = event.target.value;
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');
    }
    if (qtyField == 'qty_5x3_5') {
      this.qty_5x3_5 = event.target.value;
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');
    }
    if (qtyField == 'qty_7x11') {
      this.qty_7x11 = event.target.value;
      event.target.value = event.target.value.replace(/[^0-9]*/g, '');
    }
  }

  valChangedQty2(event, qtyField) {
    this.enableSaveBtn = true;
    // event.target.value = event.target.value.replace(/[^0-9]*/g, '');
    // console.log(qtyField)

    this.limitQty = event.target.value;
  }

  getSignCreatives() {
    this.appService
      .getDropdownOptions('getSignCreatives', { status: [1] })
      .then(data => {
        this.signCreativeArray = data.result.data.data;
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
    if (this.activeModData.logos.length > 11 && from == 'images') {
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
    } else if (from == 'icon_path ' && this.activeModData.icons.length > 3) {
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
            if (this.activeModData.logos.length) {
              this.activeModData.logos = [
                ...this.activeModData.logos,
                ...res.data.selectedAssets
              ];
            } else {
              this.activeModData.logos = res.data.selectedAssets;
            }
            this.activeModData.logos = _.unionBy(
              this.activeModData.logos,
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
    this.getPromotionRevision();
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
        mode: 'split-mod',
        action: 'signage'
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

  change(event, filedname) {
    // if (event) {
    this.enableSaveBtn = true;
    // }
    if (filedname == 'header_id') {
      this.activeModData.header_id = this.editModForm.value.header_id;
    }
    if (filedname == 'uom') {
      this.activeModData.uom = this.editModForm.value.uom;
    }
  }

  createForm() {
    this.editModForm = this.fb.group({
      header_id: [''],
      headline: [''],
      underline: [null],
      uom: [null],
      sign_creative_id: [null],
      reg_retail: [null],
      bmsm_price: [null],
      bmsm_qty: [null],
      promo_price: [null],
      promo_qty: [null],
      regular_price: [null],
      regular_qty: [null],
      buy_x: [null],
      get_x: [null],
      get_item: [null],
      limit_quantity: [null],
      save_amount: [null],
      save_copy: [null],

      sale_price: [null],
      single_item_price: [null],
      quantity: [null],
      limit: [null],
      crv: [null],
      market: [null],
      dept_group: [null],
      from_to_date: ['', Validators.required],
      notes: [null],

      qty_7x11: [null],
      qty_3x8: [null],
      qty_5x3_5: [null],

      offer_type_id: [null],

      pricing_values: this.fb.array([])
    });
  }

  getPreFilDeptId(mod) {
    this.adsService
      .getAdModules([
        { url: 'getDepartments' },
        {
          column: '',
          pageNumber: 1,
          pageSize: 21,
          search: '',
          sort: 'asc'
        }
      ])
      .then(res => {
        if (res.result.success && res.result.data.data.length) {
          this.deptList = res.result.data.data;

          let dpt_grp = mod.dept_group;
          let dpt_arr = [];
          dpt_arr = dpt_grp.split(': ');
          let dpt_name = dpt_arr[1];

          this.deptList.forEach(dept => {
            // console.log(c, dept.name);

            if (dept.name == dpt_name) {
              this.dpt_id = dept.id;
              // console.log(this.dpt_id);
            }
          });
        }
      });
  }
  getActiveMod(mod, from, inde) {
    // console.log(inde);

    this.indxValue = inde;
    // return;

    // this.getDepartmnetsList();

    this.showDateValidation = false;

    this.getPreFilDeptId(mod);

    this.isBlank = mod.is_blank == 'yes' ? true : false;

    this.selectedModId = mod.signage_id;
    this.noData = false;
    let idx = _.findIndex(this.selectedPageData, {
      signage_id: mod.signage_id
    });
    this.activeModData = mod;
    // console.log()
    if (from != 'split') {
      this.selectedTabIndex = 0;
    }
    let headerIdx = _.findIndex(this.headerCreativeArray, {
      id: this.activeModData['header_id'] ? this.activeModData['header_id'] : ''
    });
    this.currentHeader =
      headerIdx > -1 ? this.headerCreativeArray[headerIdx].name : '';

    this.editModForm.controls['offer_type_id'].patchValue(
      this.selectedOfferType
    );
    this.formReady = false;
    this.getSignagePricingData(this.selectedOfferType, 'change');

    // this.getSignagePricingData(this.selectedOfferType, 'change');

    if (this.editModForm) {
      // console.log('ssdssdsd')
      this.editModForm.patchValue({
        header_id: this.activeModData['header_id']
          ? this.activeModData['header_id']
          : '',
        headline: this.activeModData['headline'],
        underline: this.activeModData['underline'],
        uom: this.activeModData['uom'] ? this.activeModData['uom'] : '',
        reg_retail: this.activeModData['reg_retail'],
        sale_price: this.activeModData['sale_price'],
        single_item_price: this.activeModData['single_item_price'],
        quantity: this.activeModData['quantity'],
        limit: this.activeModData['limit'],
        crv: this.activeModData['crv'] ? this.activeModData['crv'] : '',
        market: this.activeModData['market'],
        dept_group: this.activeModData['dept_group'],
        from_date: this.activeModData['from_date'],
        to_date: this.activeModData['to_date'],
        notes: this.activeModData['notes'],
        sign_creative_id: this.activeModData['sign_creative_id']
          ? this.activeModData['sign_creative_id']
          : '',
        qty_7x11: this.activeModData['qty_7x11'],
        qty_3x8: this.activeModData['qty_3x8'],
        qty_5x3_5: this.activeModData['qty_5x3_5'],

        bmsm_price: this.activeModData['bmsm_price'],
        bmsm_qty: this.activeModData['bmsm_qty'],
        promo_price: this.activeModData['promo_price'],
        promo_qty: this.activeModData['promo_qty'],
        regular_price: this.activeModData['regular_price'],
        regular_qty: this.activeModData['regular_qty'],
        buy_x: this.activeModData['buy_x'],
        get_x: this.activeModData['get_x'],
        get_item: this.activeModData['get_item'],
        limit_quantity: this.activeModData['limit_quantity'],
        save_amount: this.activeModData['save_amount'],
        save_copy: this.activeModData['save_copy']
          ? this.activeModData['save_copy']
          : ''
      });
      if (
        this.activeModData.from_date &&
        this.activeModData.to_date &&
        this.activeModData.to_date != 'Invalid date'
      ) {
        this.editModForm.controls['from_to_date'].setValue({
          startDate: moment(this.activeModData.from_date),
          endDate: moment(this.activeModData.to_date)
        });
      } else {
        this.editModForm.controls['from_to_date'].setValue('');
      }
      this.enableSaveBtn = false;
    }
    this.selectedRowsData.signage_id = this.activeModData.signage_id;
    // this.selectedOfferType = this.activeModData['offer_type_id']
    //   ? this.activeModData['offer_type_id']
    //   : '';
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
    // if (this.activeModData.promotions.length) {
    this.getPromotionRevision();
    // } else {
    //   this.noData = true;
    //   this.dataLoad = false;
    // }
  }
  // getCurrentPromotion() {
  //   let prms = {
  //     ad_id: this.appService.adId,
  //     promotion_id: '5def44576b7d1d025a7d574f',
  //     promo_id: 305910,
  //     signage_id: this.activeModData.signage_id
  //   };
  //   this.adsService
  //     .getVehicles([{ url: 'getSignagePromotion' }, prms])
  //     .then(res => {
  //       if (res.result.data.data.length) {
  //         this.currentPromoData = res.result.data.data[0];
  //       }
  //       this.promoHeaders = res.result.data.headers;
  //       // this.promoHeaders.push({
  //       //   format: '',
  //       //   key: 'chkboxx',
  //       //   name: '',
  //       //   type: 'text',
  //       //   updated: 0,
  //       //   width: 100
  //       // });
  //       this.updatedColumns = res.result.data.updated_columns;
  //     });
  // }

  getUnitVarieties() {
    this.adsService.getVehicles([{ url: 'getUnitVarieties' }, {}]).then(res => {
      if (res.result.success) {
        this.offerUnits = res.result.data.units;
        this.offerVarieties = res.result.data.variety;
      }
    });
  }

  getPromotionRevision() {
    // if (
    //   this.previousSignagePromotionId ==
    //   this.activeModData.promotions[this.selectedTabIndex].promo_id
    // ) {
    //   return;
    // }
    // this.previousSignagePromotionId = this.activeModData.promotions[
    //   this.selectedTabIndex
    // ].promo_id;
    // if (this.activeModData.promotions.length) {
    this.adsService
      .getVehicles([
        { url: 'getSignagePromotion' },
        {
          // promotion_id: this.activeModData.promotions[this.selectedTabIndex]
          //   .id,
          ad_id: this.appService.adId,
          promo_id: this.activeModData.promo_id,
          id: this.activeModData.signage_id
        }
      ])
      .then(res => {
        // let revData = res.result.data.data;
        let revData = res.result.data.revision_data;
        this.rowData = res.result.data.data;
        if (this.rowData.length) {
          this.noData = false;
          this.dataLoad = false;
          // this.isBlank = false;
        } else {
          this.noData = true;
          this.dataLoad = false;
        }
        if (!this.promoHeaders.length) {
          this.promoHeaders = res.result.data.headers;
          // this.promoHeaders.push({
          //   format: '',
          //   key: 'chkboxx',
          //   name: '',
          //   type: 'text',
          //   updated: 0,
          //   width: 100
          // });
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
              promotion_id: this.activeModData.promotions[this.selectedTabIndex]
                .id
            });
            if (
              idx > -1 &&
              this.selectedRowsData.promotions[idx].items.length &&
              this.gridApi
            ) {
              this.gridApi.forEachNode(node => {
                let idx1 = this.selectedRowsData.promotions[idx].items.indexOf(
                  node.data.item_id
                );
                if (idx1 > -1) {
                  node.setSelected(true);
                  node.setExpanded(true);
                }
              });
            }
          }
        }, 200);
      });
    // }
  }

  saveModData() {
    // console.log(this.editModForm.value )
    // console.log(this.editModForm.value.from_to_date.endDate )

    // console.log(moment(this.editModForm.value.from_to_date.from_date).format('MM/DD/YYYY'))
    this.submitted = true;

    if (
      this.editModForm.value.from_to_date.startDate == null ||
      this.editModForm.value.from_to_date.endDate == null
    ) {
      this.showDateValidation = true;
      return;
    }
    // if (this.editModForm.invalid) {
    //   return;
    // }
    this.showDateValidation = false;

    // console.log(this.editModForm)
    let params = {
      // headline: this.activeModData
      //   .headline
      //   ? this.activeModData.headline
      //   : '',
      // header: this.activeModData.header
      //   ? this.activeModData.header
      //   : '',
      // sign_descriptor_copy_statement: this.activeModData.sign_descriptor_copy_statement
      //   ? this.activeModData.sign_descriptor_copy_statement
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
      // reg_retail: this.activeModData.reg_retail,
      // regular_qty: this.activeModData.regular_qty,
      // promo_price: this.activeModData.promo_price,
      // promo_qty: this.activeModData.promo_qty
      offer_type_id: this.editModForm.value.offer_type_id,
      market: this.editModForm.value.market,
      uom: this.editModForm.value.uom,
      notes: this.editModForm.value.notes,
      underline: this.editModForm.value.underline,
      crv: this.editModForm.value.crv,

      sign_creative_id: this.editModForm.value.sign_creative_id,
      headline: this.editModForm.value.headline,
      header_id: this.editModForm.value.header_id,
      reg_retail: this.editModForm.value.reg_retail,
      sale_price: this.editModForm.value.sale_price,
      single_item_price: this.editModForm.value.single_item_price,
      image_details: this.editModForm.value.image_details,
      limit: this.editModForm.value.limit,
      quantity: this.editModForm.value.quantity,
      qty_7x11: this.qty_7x11,
      qty_3x8: this.qty_3x8,
      qty_5x3_5: this.qty_5x3_5,
      logos: this.activeModData.logos,
      id: this.activeModData.signage_id,

      bmsm_price: this.editModForm.value.bmsm_price,
      bmsm_qty: this.editModForm.value.bmsm_qty,
      promo_price: this.editModForm.value.promo_price,
      promo_qty: this.editModForm.value.promo_qty,
      regular_price: this.editModForm.value.regular_price,
      regular_qty: this.editModForm.value.regular_qty,
      buy_x: this.editModForm.value.buy_x,
      get_x: this.editModForm.value.get_x,
      get_item: this.editModForm.value.get_item,
      limit_quantity: this.editModForm.value.limit_quantity,
      save_amount: this.editModForm.value.save_amount,
      save_copy: this.editModForm.value.save_copy,

      from_date: moment(this.editModForm.value.from_to_date.startDate).format(
        'MM/DD/YYYY'
      ),
      to_date: moment(this.editModForm.value.from_to_date.endDate).format(
        'MM/DD/YYYY'
      ),
      header: this.currentHeader
    };

    // console.log(params.limit);
    // params.from_date = this.editModForm.value['from_to_date'].startDate
    //   ? moment(this.editModForm.value['from_to_date'].startDate).format(
    //       'YYYY-MM-DD'
    //     )
    //   : '';
    // params.to_date = this.editModForm.value['from_to_date'].endDate
    //   ? moment(this.editModForm.value['from_to_date'].endDate).format(
    //       'YYYY-MM-DD'
    //     )
    //   : '';

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
    params = { ...params };
    // console.log(this.activeModData);

    this.adsService.getAdModules([{ url: 'saveSignage' }, params]).then(res => {
      if (res.result.success) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Signage Details Updated Successfully'
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
    if (this.filteredMods.length != this.selectedPageData.length) {
      this.getActiveMod(this.filteredMods[0], '', this.emptySignIndex);
    }
  }

  splitMod() {
    this.dialogRefSplitMod = this.dialog.open(SplitModComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog', 'split-mod-dialog'],
      width: '720px',
      data: {
        rowData: this.selectedRowsData,
        pagesInfo: this.data.pagesInfo,
        selectedRow: { ad_id: this.appService.adId },
        currentPageDetails: this.data.modData,
        mode: 'split-mod'
      }
    });

    this.dialogRefSplitMod.afterClosed().subscribe(result => {
      if (result.from == 'close') {
        // this.close();
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
            signage_id: res.data.mod_details[0].signage_id
          });
          if (idx > -1) {
            this.selectedPageData.mod_details[idx] = res.data.mod_details[0];
            this.selectedPageData.mod_details.map(x => {
              x['mod_orderName'] = 'sign ' + x['mod_order'];
              x['statusName'] = x['status'] == 1 ? 'Pending' : 'Completed';
            });
            if (result.from != 'split-mod') {
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
                    x['mod_orderName'] = 'signage ' + x['mod_order'];
                    x['statusName'] =
                      x['status'] == 1 ? 'Pending' : 'Completed';
                  });
                });
            }

            this.getActiveMod(
              this.selectedPageData.mod_details[idx],
              'split',
              this.emptySignIndex
            );
            this.selectedRowsData.promotions = [];
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
        this.activeModData.logos = res.data.selectedAssets;
        this.activeModData.logos = _.unionBy(
          this.activeModData.logos,
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

  deletePreviewItems(from, mode, action, selectedItem) {
    if (action == 'deltePreviewItems') {
      if (from == 'image') {
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

  ngOnDestroy(): void {
    this.reg_retail_Obj.unsubscribe();
    this.reg_retail_Obj2.unsubscribe();
    this.reg_retail_Obj3.unsubscribe();
    this.reg_retail_Obj4.unsubscribe();
    this.reg_retail_Obj5.unsubscribe();

    this.bmsm_price.unsubscribe();
    this.bmsm_qty.unsubscribe();
    this.promo_price.unsubscribe();
    this.promo_qty.unsubscribe();
    this.regular_price.unsubscribe();
    this.regular_qty.unsubscribe();
    this.buy_x.unsubscribe();
    this.get_x.unsubscribe();
    this.get_item.unsubscribe();
    this.limit_quantity.unsubscribe();
    this.save_amount.unsubscribe();
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

  // Rajender code

  changeOfferType(key, event) {
    // console.log(22222)
    // if (event) {
    // this.enableSaveBtn = true;
    // }
    if (key == 'offer_type_id') {
      this.selectedOfferType = event;
      // this.createForm();
      this.enableSaveBtn = true;

      this.formReady = false;
      this.getSignagePricingData(event, 'change');
    }
  }

  valChangedInOffer(field) {
    this.enableSaveBtn = true;
    // console.log(field)
  }

  getSignagePricingData(offerType, from) {
    this.activeModData['is_delete'];
    let length = this.pricing_values.length;
    if (this.pricing_values.length) {
      for (let i = 0; i < length; i++) {
        this.pricing_values.removeAt(0);
      }
    }
    let params = {
      offer_type_id: offerType,
      signage_id: this.selectedModId
        ? this.selectedModId
        : this.activeModData.mod_id,
      ad_id: this.appService.adId
    };
    this.adsService
      .getAdModules([{ url: 'getSignagePricingData' }, params])
      .then(res => {
        // console.log(res.result.data.pricing, 'ww')

        this.pricingValues = res.result.data.pricing[0].pricing_values;
        this.pricingHeaders = res.result.data.pricingHeaders;
        if (this.pricingHeaders.length == 0) {
          this.formReady = true;
        }
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
        // this.pricingHeaders.push({
        //   name: 'Dept Callout',
        //   key: 'dept_callout',
        //   type: 'dropDown',
        //   options: [
        //     {
        //       id: 'In Our Deli',
        //       name: 'In Our Deli'
        //     },
        //     {
        //       id: 'In Our Bakery',
        //       name: 'In Our Bakery'
        //     }
        //   ]
        // });
        // }
        this.pricingData = res.result.data.pricing.length
          ? res.result.data.pricing[0]
          : res.result.data.pricing;

        // if(res.result.data.pricing.length) {
        //   this.editModForm.controls['offer_start_date'].patchValue(
        //     this.pricingData['offer_start_date']
        //   );
        //   this.editModForm.controls['offer_end_date'].patchValue(
        //     this.pricingData['offer_start_date']
        //   );

        // }

        // if (this.pricingData['offer_start_date']) {
        //   if (
        //     moment(this.pricingData['offer_start_date']).diff(
        //       moment(new Date()),
        //       'days'
        //     ) >= 0
        //   ) {
        //     this.minEndDate = moment(this.pricingData['offer_start_date']).add(
        //       0,
        //       'days'
        //     )['_d'];
        //   }
        // }
        // if (this.pricingData['offer_end_date']) {
        //   // if (moment(this.activeModData['offer_end_date']).diff(moment(new Date()), 'days') >= 0) {
        //   this.maxStrtDate = moment(this.pricingData['offer_end_date']).add(
        //     0,
        //     'days'
        //   )['_d'];
        //   // }
        // }
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
  chkBoxChnged(evnt) {
    console.log(25);
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

  createControls() {
    this.pricingHeaders.forEach(attr => {
      if (this.pricing_values.length < this.pricingHeaders.length) {
        this.pricing_values.push(this.createFormGroup(attr));
      }
    });
    // console.log(this.editModForm);
    this.formReady = true;
  }
  createFormGroup(attr) {
    // console.log(this.pricingData)
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
}
