import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObservableInput, Observable, Subject } from 'rxjs';

const APP: any = window['APP'];
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public getLoginApi = APP.api_url + 'getLogin';
  public forgotPasswordApi = APP.api_url + 'forgotPassword';
  
  constructor(private http: HttpClient) { }

  getLogin = param => {
    return this.http
      .post(this.getLoginApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  forgotPassword = param => {
    return this.http
      .post(this.forgotPasswordApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
