import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-offer-unit-cell',
  templateUrl: './offer-unit-cell.component.html',
  styleUrls: ['./offer-unit-cell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OfferUnitCellComponent implements ICellRendererAngularComp {
  public offerUnitSelectOptions = [
    { id: 'E', name: 'E' },
    { id: 'LB', name: 'LB' },
    { id: 'W', name: 'W' },
    { id: 'L', name: 'L' },
    { id: 'LW', name: 'LW' }
  ];
  public imageYesNoOptions = [
    { id: 'YES', name: 'YES' },
    { id: 'NO', name: 'NO' }
  ];

  public promotionUnitOptions = [
    { id: 'EA', name: 'EA' },
    { id: 'LB', name: 'LB' }
  ];
  public channelTypes = this.appService.channelTypes;
  public channels = this.appService.channels;
  public formats = this.appService.formats;
  public banners = this.appService.banners;
  public offerModels = this.appService.offerModels;

  public OfferUnitCellValue: any;
  public OfferUnitCellValue2: any;
  public params: any;
  public gridApi: any;
  public value = '';
  constructor(private http: HttpClient, public appService: AppService) {}

  agInit(params: any): void {
    this.params = params;
    this.gridApi = params.api;
    if (params.value) {
      this.OfferUnitCellValue = params.value.id
        ? params.value.id
        : params.value;
    }
    this.value = params.value;
    this.OfferUnitCellValue2 =
      params.value === undefined || params.value === null ? false : true;
  }

  refresh(params: any): boolean {
    this.params = params;
    this.setOfferUnitCellValue(params);
    return true;
  }
  getValue(): any {
    return this.value;
  }
  setOfferUnitCellValue(params) {
    this.OfferUnitCellValue = params.value;
  }

  offerUnitChanged(event: any) {
    this.value = event;
    // console.log(this.params);
    // console.log(event);
    const focusedCell = this.gridApi.getFocusedCell();
    const rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
    rowNode.setDataValue(focusedCell.column.colDef.field, event);
  }
}
