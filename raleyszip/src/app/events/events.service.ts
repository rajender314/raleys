import { Injectable } from '@angular/core';
import { ObservableInput, Subject } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const APP: any = window['APP'];
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private promise: ObservableInput<any>;
  public enableSave = new Subject<any>();
  public getEventsApi = APP.api_url + 'getEvents';
  public createEventApi = APP.api_url + 'createEvent';
  public getEventTypesApi = APP.api_url + 'getEventTypes';
  constructor(private http: HttpClient) {}
  getEvents = param => {
    return this.http
      .get(this.getEventsApi, { params: param })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getEventsData = param => {
    return this.http.get(this.getEventsApi, { params: param });
  };

  createEvent = param => {
    return this.http
      .post(this.createEventApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  getEventTypes = param => {
    return this.http
      .post(this.getEventTypesApi, param)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
