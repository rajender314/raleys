import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from '@app/app.service';
import { GridLayoutDesignerComponent } from '../grid-layout-designer/grid-layout-designer.component';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { trigger, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';

// interface FoodNode {
//   name: string;
//   base?: FoodNode[];
// }
@Component({
  selector: 'app-ad-design',
  templateUrl: './ad-design.component.html',
  styleUrls: ['./ad-design.component.scss'],
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdDesignComponent implements OnInit {
  pages: any;
  selectedPage: any;
  selectedTool: any;
  showPageInfo = false;
  public isOpen: any;
  public totalData = [];
  public currentLayout = [];
  public noData: boolean;
  public progress = true;
  private selectedBase: any;
  private selectedBaseTitle: any;
  activePage: any;
  // treeControl = new NestedTreeControl<FoodNode>(node => node.base);
  // dataSource = new MatTreeNestedDataSource<FoodNode>();
  constructor(
    private appService: AppService,
    private adsService: AdsService,
    private router: Router
  ) {
    // this.dataSource.data = this.totalData;
  }

  // hasChild = (_: number, node: FoodNode) => !!node.base && node.base.length > 0;
  ngOnInit() {
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
    this.getBaseVersionsData();
    if (this.appService.adDetails) {
      this.pages = this.appService.adDetails['pages_details'];
      // this.selectPage(this.pages[0]);
      this.selectTool('block');
    }
  }
  selectPage(page) {
    this.selectedPage = this.updateModDetails(page);
    this.selectedPage.cols = 4;
    this.selectedPage.rows = 13;
    this.selectedPage.width = 9 * 96;
    // this.selectedPage.height = 21 * 96;
    this.selectedPage.height = 21 * 105;
  }
  updateModDetails(selPage) {
    if (selPage.blocks && selPage.blocks.length) {
      selPage.blocks.map(params => {
        if (params.sequenceId && params.type === 'block') {
          const i = _.findIndex(<any>this.appService.currentBaseValues, {
            mod_order: parseInt(params.sequenceId, 10)
          });
          // fetching data from promotions :: need to delted when data updated
          const param = {
            ad_id: this.appService.adId,
            pageNumber: this.activePage,
            modNumber: parseInt(params.sequenceId, 10),
            versions:
              i > -1
                ? this.appService.currentBaseValues[i].versions.split(',')
                : [],
            filter: true,
            promo_id:
              i > -1
                ? this.appService.currentBaseValues[i].promo_ids.split(',')
                : []
          };
          // this.getPromoData(param, i);
          this.adsService
            .getAdModules([{ url: 'getPromotionView' }, param])
            .then(res => {
              const promoData = res.result.data.data;
              if (promoData.length && i > -1) {
                params.headline = promoData[0].headline;
                params.bodycopy = promoData[0].body_copy;
                params.brand = promoData[0].brand;
                this.appService.currentBaseValues[i].headline =
                  promoData[0].headline;
                this.appService.currentBaseValues[i].body_copy =
                  promoData[0].body_copy;
                this.appService.currentBaseValues[i].brand = promoData[0].brand;
              }
            });
          if (i > -1) {
            params.price = this.appService.currentBaseValues[i].price;
            params.price_fct = this.appService.currentBaseValues[i].price_fct;
            // params.headline = this.appService.currentBaseValues[i].icon_path;
            // params.bodycopy = this.appService.currentBaseValues[i].body_copy;
            params.icons = this.appService.currentBaseValues[i].icon_path;
            // params.brand = this.appService.currentBaseValues[i].brand;
          }
        } else if (
          params.type === 'layout' &&
          params.blocks &&
          params.blocks.length
        ) {
          params.blocks.map(param => {
            if (param.sequenceId) {
              const i = _.findIndex(<any>this.appService.currentBaseValues, {
                mod_order: parseInt(param.sequenceId, 10)
              });
              const par = {
                ad_id: this.appService.adId,
                pageNumber: this.activePage,
                modNumber: parseInt(param.sequenceId, 10),
                versions: this.appService.currentBaseValues[i].versions.split(
                  ','
                ),
                promo_id:
                  i > -1
                    ? this.appService.currentBaseValues[i].promo_ids.split(',')
                    : [],
                filter: true
              };
              // this.getPromoData(par, i);
              this.adsService
                .getAdModules([{ url: 'getPromotionView' }, par])
                .then(res => {
                  const promoData = res.result.data.data;
                  if (promoData.length && i > -1) {
                    param.headline = promoData[0].headline;
                    param.bodycopy = promoData[0].body_copy;
                    param.brand = promoData[0].brand;
                    this.appService.currentBaseValues[i].headline =
                      promoData[0].headline;
                    this.appService.currentBaseValues[i].body_copy =
                      promoData[0].body_copy;
                    this.appService.currentBaseValues[i].brand =
                      promoData[0].brand;
                  }
                });
              if (i > -1) {
                param.price = this.appService.currentBaseValues[i].price;
                param.price_fct = this.appService.currentBaseValues[
                  i
                ].price_fct;
                // param.headline = this.appService.currentBaseValues[i].icon_path;
                // param.bodycopy = this.appService.currentBaseValues[i].body_copy;
                param.icons = this.appService.currentBaseValues[i].icon_path;
                // param.brand = this.appService.currentBaseValues[i].brand;
              }
            }
          });
        }
      });
    }
    // this.selectPage(selPage);
    selPage = Object.assign({}, selPage, { activePage: this.activePage });
    this.selectedPage = selPage;
    return selPage;
  }
  selectTool(tool) {
    this.selectedTool = tool;
  }
  getPromoData(param, i) {
    this.adsService
      .getAdModules([{ url: 'getPromotionView' }, param])
      .then(res => {
        const promoData = res.result.data.data;
        if (promoData.length && i > -1) {
          this.appService.currentBaseValues[i].headline = promoData[0].headline;
          this.appService.currentBaseValues[i].body_copy =
            promoData[0].body_copy;
          this.appService.currentBaseValues[i].brand = promoData[0].brand;
        }
      });
  }
  toggleInfo() {
    this.showPageInfo = !this.showPageInfo;
    this.selectTool(null);
  }

  @HostListener('click', ['$event'])
  hidePopup(): void {
    if (GridLayoutDesignerComponent.blockInfoPopup) {
      GridLayoutDesignerComponent.blockInfoPopup = null;
    }
    if (this.showPageInfo) {
      this.showPageInfo = false;
    }
  }
  getBaseVersionsData() {
    const params = {
      ad_id: this.appService.adId,
      type: 'all'
      // base_id: obj.base_id
    };
    this.progress = true;
    this.adsService.getBaseVersions(params).then(res => {
      if (res.result.success) {
        this.totalData = res.result.data;
        // this.dataSource.data = this.totalData;
        if (this.totalData.length) {
          this.noData = false;
          this.totalData[0].show = true;
          this.selectedBase = this.totalData[0].base[0].value;
          this.selectedBaseTitle = this.totalData[0].page;
          this.activePage = this.totalData[0].page;
          this.getBasePrices(
            this.totalData[0].base[0],
            this.totalData[0].base_id
          );
          const currentObj = {
            versions: this.totalData[0].base_version[
              this.totalData[0].base[0].key
            ],
            pageNumber: this.totalData[0].page,
            base_id: this.totalData[0].base_id,
            current_base: this.totalData[0].base[0].key
          };
          this.appService.currentObj = currentObj;
        } else {
          this.noData = true;
        }
      }
      this.progress = false;
    });
  }
  getBasePrices(obj, id) {
    const params = {
      base_value: obj.key,
      base_id: id,
      isLayout: 'yes'
    };
    this.adsService.getBasePrices(params).then(res => {
      this.appService.currentBaseValues = res.result.data.data;
      this.currentLayout = res.result.data.layout;
      // this.selectPage({ data: res.result.data });
      this.selectPage(
        res.result.data.layout[this.appService.currentObj.current_base]
          ? res.result.data.layout[this.appService.currentObj.current_base]
          : { data: res.result.data }
      );
    });
  }
  dropdownTrigger(list) {
    this.selectedVal(list.base[0], list);
    this.totalData.forEach(attr => {
      attr.show = false;
    });
    // if(list.length){
    // }
    list.show = !list.show;
  }
  selectedVal(base, data) {
    const i = _.findIndex(this.totalData, { page: data.page });
    const currentObj = {
      versions: i > -1 ? this.totalData[i].base_version[base.key] : '',
      pageNumber: data.page,
      base_id: data.base_id,
      current_base: base.key
    };
    this.updateModDetails(
      this.totalData[i].layout[currentObj.current_base]
        ? this.totalData[i].layout[currentObj.current_base]
        : { data: data }
    );
    this.selectedBaseTitle = data.page;
    this.selectedBase = base.value;
    this.activePage = data.page;
    this.appService.currentObj = currentObj;
    this.getBasePrices(base, data.base_id);
  }

  // selectedVal(base, data) {
  //   let pageData = data.expansionModel.selected[0];
  //   let i = _.findIndex(this.totalData, { page: pageData.page });
  //   let currentObj = {
  //     versions: i > -1 ? this.totalData[i].base_version[base.key] : '',
  //     pageNumber: pageData.page,
  //     base_id: data.base_id,
  //     current_base: base.key
  //   };
  //   this.selectPage(
  //     this.totalData[i].layout[currentObj.current_base]
  //       ? this.totalData[i].layout[currentObj.current_base]
  //       : { data: pageData }
  //   );
  //   this.selectedBaseTitle = pageData.page;
  //   this.selectedBase = base.value;
  //   this.appService.currentObj = currentObj;
  //   this.getBasePrices(base, pageData.base_id);
  // }

  onCreate(data) {
    this.updateBaseVersions();
    // let updateParams={
    //   base_id :this.appService.currentObj.base_id,
    //   ad_id : this.appService.adId,
    //   layout: {}
    //    }
    //    var obj ={ }
    //    obj[this.appService.currentObj.current_base] = this.selectedPage;
    //    updateParams.layout=(Object.assign({}, updateParams.layout ,obj))
    //    this.adsService.updateFeatureItems([{ url: 'updateBaseVersion' }, updateParams])
    //    .then(res => {
    //    });
  }
  deleteBlock(data) {
    this.updateBaseVersions();
  }
  updateBaseVersions() {
    const updateParams = {
      base_id: this.appService.currentObj.base_id,
      ad_id: this.appService.adId,
      layout: this.currentLayout
    };
    const obj = {};
    setTimeout(() => {
      obj[this.appService.currentObj.current_base] = this.selectedPage;
      updateParams.layout = Object.assign({}, updateParams.layout, obj);
      this.adsService
        .updateFeatureItems([{ url: 'updateBaseVersion' }, updateParams])
        .then(res => {});
    });
  }
}
