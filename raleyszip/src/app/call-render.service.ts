import { Injectable } from '@angular/core';
import { HttpClient } from 'selenium-webdriver/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
/* USAGE DESC
  **********Receiving event anywher(for synchronous) **********
  ngAfterContentInit() {
    this._eventService.receiveEvent('epi', response => { console.log(response); } );
  }
  ngOnInit() {
    this._eventService.sendEvent('epi', {id: 'emit me global'});
  }
  **********Receiving event anywher(for asynchronous) **********
  setTimeout(() => { this._eventService.promise('epi', 'test message'); }, 1000);
  this._eventService.resolve('epi', Response => { console.log(Response); } );

  **********Data distribution in Component **********
    this._eventService.setter('epi', {id: 100});
    this._eventService.getter('epi', response => { console.log(response); })

    **********HTTP Call********************
  const params = {
      url: 'https://www.w3schools.com/angular/customers.php',
      params:{a:1, [ob1],[ob2...]},
      type: get or 'post'
    };
  this._eventService.executeCall(params, success => { console.log(success); }, fail => { console.log(fail); });
*/
export class CallRenderService {
  public _observer: any = [];
  public _shareData: any = [];
  private behaviourSubject = new BehaviorSubject({ key: 'noEvent', data: {} });
  private _subObserver = this.behaviourSubject.asObservable();
  private promiseEmitter;
  constructor(private httpClient: HttpClient) {}
  ngOnInit() {}
  sendEvent(eventName: string, data: any) {
    this._observer[eventName] = new Observable(changes => changes.next(data));
  }
  receiveEvent(eventName: string, emitter: any) {
    if (this._observer[eventName]) {
      this._observer[eventName].subscribe(result => {
        emitter({ success: true, data: result });
      });
    } else {
      emitter({ success: false });
    }
  }
  promise(eventName: string, data: any) {
    const temp = { key: eventName, data: data };
    this.behaviourSubject.next({ key: eventName, data: data });
  }
  resolve(eventName: string, emitter: any) {
    this.promiseEmitter = this._subObserver.subscribe(result => {
      if (result.key !== 'noEvent') {
        if (result['key'] === eventName) {
          emitter({ success: true, data: result });
        } else {
          emitter({ success: false });
        }
      }
    });
  }
  destroyPromise() {
    this.promiseEmitter.unsubscribe();
  }
  setter(key: string, data: any) {
    this._shareData[key] = data;
  }
  getter(key: string, fetcher: any) {
    if (this._shareData[key]) {
      fetcher({ success: true, data: this._shareData[key] });
    } else {
      fetcher({ success: false });
    }
  }

  executeCall(request: any, success: any, error: any = 0) {
    let requestArgs = request.params;
    if (request.type === 'get') {
      let params = new HttpParams();
      Object.keys(request.params).map(
        key => (params = params.append(key, request.params[key]))
      );
      requestArgs = { params };
    }

    if (request.url) {
      return this.httpClient[request.type](request.url, requestArgs).subscribe(
        data => {
          success(data);
        },
        fail => {
          if (error) {
            error(fail);
          }
        }
      );
    }
  }
}
