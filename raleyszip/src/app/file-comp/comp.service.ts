import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompService {
  constructor(private http: HttpClient) {}
  sendOuput = (api, params) => {
    return this.http
      .post(api, params)
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
