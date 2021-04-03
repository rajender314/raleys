import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  OnDestroy
} from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';
import { MatDatepicker } from '@angular/material';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-date-editor',
  templateUrl: './date-editor.component.html',
  styleUrls: ['./date-editor.component.scss']
})
export class DateEditorComponent
  implements ICellEditorAngularComp, AfterViewInit, OnDestroy {
  private params: any;
  public value: any;
  private cancelBeforeStart: boolean = false;

  @ViewChild('picker', { read: MatDatepicker }) picker: MatDatepicker<Date>;

  currentdate: any;
  serializedDate: FormControl;
  agInit(params: any): void {
    if (params.value == '' || params.value == null) return;
    this.value = moment(params.value).format('MM/DD/YY');
    this.currentdate = new Date(params.value);
    this.params = params;
    // this.serializedDate = new FormControl(
    //   new Date(this.currentdate).toISOString()
    // );
  }
  getValue(): any {
    if (this.value == 'Invalid date') {
      this.value = this.params.value.split(',')[0];
    }
    return this.value;
  }
  isPopup(): boolean {
    return true;
  }
  onKeyDown(event): void {}

  // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
  ngAfterViewInit() {
    setTimeout(() => {
      this.picker.open();
    }, 1000);
  }
  // openCalendar(picker: MatDatepicker<Date>) {
  //   picker.open();
  // }
  dateValueChange(event) {
    this.value = moment(event.value).format('MM/DD/YYYY');
    this.params.api.stopEditing();
  }

  ngOnDestroy(): void {
    // console.log('destroy called ...');
    // console.log(this.picker);
  }
}
