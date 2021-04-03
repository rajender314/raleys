import { Component } from '@angular/core';
import { AppService } from '@app/app.service';
const APP: any = window['APP'];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Omni Offer';
  isUserLogin = APP.loginDetails;
  constructor(private appService: AppService) {}
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.getLabels();
    this.getHeaderPermissions();
    // this.getForms();
  }

  getLabels() {
    this.appService.getLabels({}).then(res => {
      this.appService.totalConfigData = res.result.data;
      this.appService.configData.next(res.result);
    });
  }
  getHeaderPermissions() {
    this.appService.getHeaderPermissions().then(res => {
      this.appService.headerPermissions = res.result.data;
    });
  }
  // getForms(){
  //   this.appService.getForms().then(res =>{
  //     console.log(res);
  //     this.appService.formDetails = res.result.data.data;
  //   })
  // }
}
