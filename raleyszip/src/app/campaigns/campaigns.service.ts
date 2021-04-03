import { Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { ObservableInput, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const APP: any = window['APP'];

@Injectable({
  providedIn: 'root'
})
export class CampaignsService {
  private promise: ObservableInput<any>;
  public enableSave = new Subject<any>();
  public getCampaignsApi = APP.api_url + 'getCampaigns';
  public createCampaignApi = APP.api_url + 'createCampaign';
  constructor(private http: HttpClient) {}

  getCampaigns = param => {
    return this.http
      .post(this.getCampaignsApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  createCampaign = param => {
    return this.http
      .post(this.createCampaignApi, param)
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
