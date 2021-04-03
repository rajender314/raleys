import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'price-cell',
  template: `
    <input
      #input
      (keydown)="onKeyDown($event)"
      [(ngModel)]="value"
      style="width: 100%"
    />
  `
})
export class ImageEditor implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: number;
  private isCtrl: boolean;
  private cancelBeforeStart: boolean = false;

  @ViewChild('input', { read: ViewContainerRef }) public input;

  agInit(params: any): void {
    this.isCtrl = false;
    this.params = params;
    this.value = this.params.value;
    // only start edit if key pressed is a number, not a letter
    this.cancelBeforeStart =
      params.charPress && '1234567890'.indexOf(params.charPress) < 0;
    this.getValue();
  }

  getValue(): any {
    return this.value;
  }

  isCancelBeforeStart(): boolean {
    return this.cancelBeforeStart;
  }

  // will reject the number if it greater than 1,000,000
  // not very practical, but demonstrates the method.
  isCancelAfterEnd(): boolean {
    return this.value > 10000000000;
  }

  onKeyDown(event): void {
    if (!this.isKeyPressedNumeric(event)) {
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }

  // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
  ngAfterViewInit() {
    window.setTimeout(() => {
      this.input.element.nativeElement.focus();
    });
  }

  private getCharCodeFromEvent(event): any {
    event = event || window.event;
    return typeof event.which === 'undefined' ? event.keyCode : event.which;
  }

  private isCharNumeric(charStr): boolean {
    const validateSts = false;
    return validateSts;
  }

  private isKeyPressedNumeric(event): boolean {
    this.isCtrl = event.ctrlKey;
    const charCode = this.getCharCodeFromEvent(event);
    const charStr = event.key ? event.key : String.fromCharCode(charCode);
    return this.isCharNumeric(charStr);
  }
}
