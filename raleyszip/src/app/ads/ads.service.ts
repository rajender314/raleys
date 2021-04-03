import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservableInput, Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

const APP: any = window['APP'];

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private promise: ObservableInput<any>;
  public importFeatureItemsApi = APP.api_url + 'importFeatureItems';
  public updateFeatureItemsApi = APP.api_url + 'updateFeatureItems';
  public createAdsApi = APP.api_url + 'createAds';
  public getChannelsApi = APP.api_url + 'getChannels';
  public getAdStoresApi = APP.api_url + 'getAdStores';
  public getMarketsApi = APP.api_url + 'getMarkets';
  public getBaseVersionsApi = APP.api_url + 'getBaseVersions';
  public getBasePricesApi = APP.api_url + 'getBasePrices';
  public getAdsDetailsApi = APP.api_url + 'adsDetails';
  public getAssetsApi = APP.api_url + 'getAssetsData';
  // public getAssetsApi1 = APP.api_url + 'getAssetInfo';

  public getIconsApi = APP.api_url + 'searchIcons';
  public displayBoxFilesApi = APP.api_url + 'displayBoxFiles';
  public importBoxFileApi = APP.api_url + 'importBoxFile';

  public saveOffersView = APP.api_url + 'saveOfferViews';
  public savePromoView = APP.api_url + 'savePromoViews';
  public saveExportView = APP.api_url + 'saveExportView';
  public saveReportView = APP.api_url + 'saveReport';

  public saveViewUrl = '';
  public savedOffersView = APP.api_url + 'getOfferViews';
  public savedPromotionsView = APP.api_url + 'getPromoViews';
  public savedAdViewsUrl = APP.api_url + 'getExportView';
  public exportAdViewUrl = APP.api_url + 'exportAdView';
  public savedFilterData = [];

  public deleteImage = APP.img_url + 'deleted.png';
  public insertImage = APP.img_url + 'inserted.png';
  public updatedImage = APP.img_url + 'updated.png';
  public getAdPreviewByIdUrl = APP.api_url + 'exportPreview';
  public getCustomAttributesUrl = APP.api_url + 'getCustomAttribute';
  public createCustomAttributesUrl = APP.api_url + 'createCustomAttribute';
  public getPromotionRevisionUrl = APP.api_url + 'getPromotionRevision';
  public hideHeader = false;
  public isImportProgess = true;
  public alive = true;
  public importProgVal = 10;
  public importProgStatus = 'Yet to start';

  constructor(private http: HttpClient, private snackbar: MatSnackBar) {}

  getImage(param: string) {
    if (param === 'deleted') {
      return this.deleteImage;
    } else if (param === 'updated') {
      return this.updatedImage;
    } else {
      return this.insertImage;
    }
  }

  getVehicles = (param: any[]) => {
    return this.getAdModules(param);
  };

  getAdModules = (param: any[]) => {
    return this.http
      .post(APP.api_url + param[0].url, param[1])
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  importFeatureItems = (param: any) => {
    return this.http
      .post(this.importFeatureItemsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  updateFeatureItems = (param: any[]) => {
    return this.getAdModules(param);
  };
  createAds = (param: any) => {
    return this.http
      .post(this.createAdsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getChannels = (param: any) => {
    return this.http
      .post(this.getChannelsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getAdStores = (param: any) => {
    return this.http
      .post(this.getAdStoresApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getMarkets = (param: any) => {
    return this.http
      .post(this.getMarketsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getBaseVersions = (param: any) => {
    return this.http
      .post(this.getBaseVersionsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getBasePrices = (param: any) => {
    return this.http
      .post(this.getBasePricesApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getAdsDetails = (param: any) => {
    return this.http
      .post(this.getAdsDetailsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  sendOuputSubscription(api, params) {
    return this.http.post(api, params);
  }
  getAssetInfo = (param: any, from: string) => {
    return this.http.post(
      from == 'icon_path' ? this.getIconsApi : this.getAssetsApi,
      param
    );
  };

  // getAssetInfo1 = (param: any, from: string) => {
  //   return this.http.post(
  //     from == 'icon_path' ? this.getIconsApi : this.getAssetsApi1,
  //     param
  //   );
  // };
  displayBoxFiles = (param: any) => {
    return this.http
      .post(this.displayBoxFilesApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  importBoxFile = (param: any[]) => {
    return this.http
      .post(param[0].url, param[1])
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  importXls = (api, param: any[]) => {
    return this.http
      .post(api, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  sendOuput(api, params) {
    return this.http
      .post(api, params)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  saveViewFilters = (param: any[]) => {
    if (param[1] === 'offers') {
      // case from  offerpage page
      this.saveViewUrl = this.saveOffersView;
    } else if (param[1] === 'saveView') {
      // case for ad-preview page's save view btn
      this.saveViewUrl = this.saveExportView;
    } else if (param[1] === 'saveReport') {
      // case for ad-preview page's save report btn
      this.saveViewUrl = this.saveReportView;
    } else {
      // case from  promotions page
      this.saveViewUrl = this.savePromoView;
    }
    return this.http
      .post(this.saveViewUrl, param[0])
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getSavedOfferViews = (param: any) => {
    return this.http
      .post(this.savedOffersView, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getSavedPromotionsViews = (param: any) => {
    return this.http
      .post(this.savedPromotionsView, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getSavedAdViews = (param: any) => {
    return this.http
      .post(this.savedAdViewsUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getCustomAttributes = (param: any) => {
    return this.http
      .post(this.getCustomAttributesUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  createCustomAttribute = (param: any) => {
    return this.http
      .post(this.createCustomAttributesUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  exportAd = (param: any) => {
    return this.http
      .post(this.exportAdViewUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  //
  // getPromoData(param, i) {
  //   let promoDataa = [];
  //   this.getAdModules([{ url: 'getPromotionView' }, param])
  //     .then(res => {
  //       promoDataa = res.result.data.data;
  //     });
  // }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    // location.reload();
    return Promise.reject(error.message || error);
  }

  // setting sticky filters data using local storage --  offers & promotions

  setStickyFilters(filterObj: {
    ad_id: any;
    offers: any;
    promotions: any;
    key: any;
  }) {
    this.savedFilterData = localStorage.getItem('savedFilterData')
      ? JSON.parse(localStorage.getItem('savedFilterData'))
      : [];

    const filterObject = {
      ad_id: filterObj.ad_id,
      offers: filterObj.offers,
      promotions: filterObj.promotions
    };

    const key = filterObj.key;
    const i = _.findIndex(this.savedFilterData, { ad_id: filterObj.ad_id });

    i > -1
      ? key === 'offers'
        ? (this.savedFilterData[i].offers = filterObject.offers)
        : (this.savedFilterData[i].promotions = filterObject.promotions)
      : this.savedFilterData.push(filterObject);

    localStorage.setItem(
      'savedFilterData',
      JSON.stringify(this.savedFilterData)
    );
  }

  // getting sticky filters data using local storage
  getStickyFilters(filterObj: { ad_id: any; key: any }) {
    const key = filterObj.key;
    this.savedFilterData = localStorage.getItem('savedFilterData')
      ? JSON.parse(localStorage.getItem('savedFilterData'))
      : [];
    const i = _.findIndex(this.savedFilterData, { ad_id: filterObj.ad_id });
    const obj =
      i > -1
        ? key === 'offers'
          ? this.savedFilterData[i].offers
          : this.savedFilterData[i].promotions
        : '';
    return obj;
  }

  // getting grid info

  // tslint:disable-next-line:max-line-length
  getGridInfo(gridObj: {
    groupInfo: any;
    filterInfo: any;
    valColumnInfo: any;
    allColumnsInfo: any;
    pivoteMode: any;
    allPivoteColumns: any;
    sortColumns: any;
  }) {
    const rowGroupArray = [];
    gridObj.groupInfo.forEach((row: { [x: string]: any }) => {
      rowGroupArray.push(row['colId']);
    });

    const fitlerInfoArray = [];
    fitlerInfoArray.push(gridObj.filterInfo);

    const valColumnInfoArray = [];
    gridObj.valColumnInfo.forEach((row: { [x: string]: any }) => {
      valColumnInfoArray.push(row['colId']);
    });

    const inVisibleColumnsInfoArray = [];
    gridObj.allColumnsInfo.forEach((row: { [x: string]: any }) => {
      if (row['visible'] !== true) {
        inVisibleColumnsInfoArray.push(row['colId']);
      }
    });

    const pivoteModeInfo = gridObj.pivoteMode;
    const sortColumns = gridObj.sortColumns;

    const allPivoteColumnsArray = [];
    gridObj.allPivoteColumns.forEach((row: { [x: string]: any }) => {
      allPivoteColumnsArray.push(row['colId']);
    });

    const gridInfo = {
      groupInfo: rowGroupArray,
      filterInfo: fitlerInfoArray,
      valColumnInfo: valColumnInfoArray,
      inVisibleColumnsInfo: inVisibleColumnsInfoArray,
      pivoteMode: pivoteModeInfo,
      allPivoteColumns: allPivoteColumnsArray,
      sortColumns: sortColumns
    };

    return gridInfo;
  }

  // get the ad preview by adId
  getAdPreviewById = (param: any) => {
    return this.http
      .post(this.getAdPreviewByIdUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  // get the promotions Revision History
  getPromotionRevision = (param: any) => {
    return this.http
      .post(this.getPromotionRevisionUrl, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  checkAdImportStatus(adId) {
    return this.http
      .post('checkAdImportStatus', { ad_id: adId })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  showImportProg() {
    this.snackbar.openFromComponent(SnackbarComponent, {
      data: {
        status: 'success',
        msg: 'Edits are restricted..'
      },
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
}
