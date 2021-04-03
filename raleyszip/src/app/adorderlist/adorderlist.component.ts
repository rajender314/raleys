import { Component, OnInit } from '@angular/core';
import { AppService } from '@app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-adorderlist',
  templateUrl: './adorderlist.component.html',
  styleUrls: ['./adorderlist.component.scss']
})
export class AdorderlistComponent implements OnInit {
  constructor(private router: Router, public appService: AppService) {}

  ngOnInit() {
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'AD_ORDER_LIST'
      });
      if (i < 0) {
        this.router.navigateByUrl('access-denied');
      }
    }
  }
}
