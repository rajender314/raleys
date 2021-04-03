import { Component, OnInit } from '@angular/core';
const APP: any = window['APP'];

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  public url = APP.api_url;

  constructor() {}

  ngOnInit() {
    window.location.href = this.url + '#/vehicles';
  }
  // goToHome(){
  //   window.location.href = this.url + '#/vehicles';

  // }
}
