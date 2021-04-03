import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservableInput, Observable, Subject } from 'rxjs';

const APP: any = window['APP'];
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private promise: ObservableInput<any>;
  public enableSave = new Subject<any>();
  public userPermissionData;

  public userTypesAndCompaniesPromise = null;
  public getUsersApi = APP.api_url + 'usersListData';

  private userTypesAndCompanies = {
    post: APP.api_url + 'getUserTypesAndCompanies',
    promise: false,
    data: null
  };
  public getHeaderPermissionsApi = APP.api_url + 'getHeaderPermissions';
  public getDivisionsApi = APP.api_url + 'getDivisions';
  public getDepartmentApi = APP.api_url + 'getDepartments';
  public getUserPermissionsApi = APP.api_url + 'getUserPermission';
  private saveuserApi = APP.api_url + 'addUser';
  private uploadLogoApi = APP.api_url + 'updateProfile';
  private resetPasswordApi = APP.api_url + 'resetPassword';
  public logoutApi = APP.api_url + 'logout';
  public registerUserApi = APP.api_url + 'registerUser';

  constructor(private http: HttpClient) {}

  getUsers = param => {
    return this.http
      .post(this.getUsersApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getUserTypesAndCompanies = param => {
    if (!this.userTypesAndCompanies.data) {
      this.userTypesAndCompanies.data = this.http
        .post(this.userTypesAndCompanies.post, param)
        .toPromise()
        .then(response => response)
        .catch(this.handleError);
      this.userTypesAndCompanies.promise = true;
    }
    return this.userTypesAndCompanies.data;
  };

  getHeaderPermissions = param => {
    return this.http
      .post(this.getHeaderPermissionsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getDivisions = param => {
    return this.http
      .post(this.getDivisionsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getDepartments = param => {
    return this.http
      .post(this.getDepartmentApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  getUserPermissions = param => {
    return this.http
      .post(this.getUserPermissionsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  saveUser = param => {
    return this.http
      .post(this.saveuserApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  uploadLogo = param => {
    return this.http
      .post(this.uploadLogoApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  resetPassword = param => {
    return this.http
      .post(this.resetPasswordApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  logout = param => {
    return this.http
      .post(this.logoutApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  registerUser = param => {
    return this.http
      .post(this.registerUserApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    // location.reload();
    return Promise.reject(error.message || error);
  }
}
