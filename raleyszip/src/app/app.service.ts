import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { ObservableInput, Observable, Subject, BehaviorSubject } from 'rxjs';

const APP: any = window['APP'];

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private promise: ObservableInput<any>;
  public configLabels = [];
  public configData = new Subject<any>();
  public adId: any;
  public subHeaders = [];
  public totalConfigData = [];
  public adName: any;
  public adDetails = [];
  public pagesInfo = [];
  public baseVersionDetails = [];
  public currentBaseValues = [];

  // ag grid -- cell  info copying

  public channelTypes = [];
  public channels = [];
  public formats = [];
  public banners = [];
  public offerModels = [];

  // closes

  private loginUserData = new BehaviorSubject([]);
  currentUserData = this.loginUserData.asObservable();

  public currentObj: any;
  constructor(private http: HttpClient) {}

  public getLabelsApi = APP.api_url + 'systemSettings';
  public getLoginDetailsApi = APP.api_url + 'loginUserDetails';
  public getCompaniesApi = APP.api_url + 'getUserTypesAndCompanies';
  public headerPermissions;
  public formDetails = [];
  changeUserData(data) {
    this.loginUserData.next(data);
  }

  getLabels = param => {
    return this.http
      .get(this.getLabelsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getLoginDetails = param => {
    return this.http
      .get(this.getLoginDetailsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getUserTypesAndCompanies = param => {
    return this.http
      .post(this.getCompaniesApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getListData(parent, child) {
    //   let i = _.findIndex(JSON.parse(APP.systemSettings), { key: 'Others' });
    if (parent === 'Top-Headers') {
      const index = _.findIndex(this.configLabels, { key: child });
      return index > -1 ? this.configLabels[index] : '';
    } else if (parent === 'Others') {
      const index = _.findIndex(this.subHeaders, { key: child });
      return index > -1 ? this.subHeaders[index] : '';
    }
  }
  getHeaderPermissions() {
    return this.http
      .post('getHeaderPermissions', {})
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  getForms() {
    var parms = {
      column: '',
      form_type: 2,
      pageNumber: 1,
      pageSize: 200,
      search: '',
      sort: 'asc'
    };
    return this.http
      .post('getForms', parms)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  getDropdownOptions(api, param) {
    return this.http
      .post(api, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }
  getFormDeatils(id) {
    return this.http
      .post('formDetails', { form_assign_id: id })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    // location.reload();
    return Promise.reject(error.message || error);
  }
}
