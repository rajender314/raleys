import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservableInput, Observable, Subject } from 'rxjs';

const APP: any = window['APP'];

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private promise: ObservableInput<any>;
  public configData = [];

  constructor(private http: HttpClient) {}

  getList = param => {
    return this.http
      .post(APP.api_url + param[0].url, param[1])
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  deleteItem = param => {
    return this.getList(param);
  };

  saveApi(url, param) {
    return this.http
      .post(APP.api_url + url, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  updateItem = param => {
    return this.getList(param);
  };

  getSkuHistory = (api, param) => {
    return this.sendOuput(api, param);
  };

  updateLabel = param => {
    return this.sendOuput('saveConfiguration', param);
  };

  importSku = param => {
    return this.sendOuput('importSku', param);
  };

  getSpects = param => {
    return this.sendOuput('getSpecs', param);
  };
  getForms = param => {
    return this.sendOuput('getForms', param);
  };

  createForm = param => {
    return this.sendOuput('createForm', param);
  };

  getModTypeColors = param => {
    return this.sendOuput('getModTypeColors', param);
  };

  formDetails = param => {
    return this.sendOuput('formDetails', param);
  };

  createSpec = param => {
    return this.sendOuput('createSpec', param);
  };

  specDetails = param => {
    return this.sendOuput('specDetails', param);
  };

  getUIElements = param => {
    return this.sendOuput('getUiElements', param);
  };

  sendEmail = param => {
    return this.sendOuput('sendEmailControllerMail', param);
  };

  showEmail = params => {
    return this.http
      .post(params[0].url, params[1])
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

  getHeaderPermissions(url) {
    return this.http
      .post(APP.api_url + url, {})
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  getUserRolePermissions(user_role_id) {
    return this.http
      .post(APP.api_url + 'getPermissions', { user_role_id: user_role_id })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  getFilterdUserRoles(searchKey) {
    return this.http
      .post(APP.api_url + 'getRoles', { search: searchKey })
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
