import { Component, OnInit, TemplateRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
@Component({
  selector: 'app-ag-custom-template',
  templateUrl: './ag-custom-template.component.html',
  styleUrls: ['./ag-custom-template.component.scss']
})
export class AgCustomTemplateComponent
  implements OnInit, ICellRendererAngularComp {
  constructor() {}

  template: TemplateRef<any>;
  templateContext: { $implicit: any; params: any };

  ngOnInit() {}

  refresh(params: any): boolean {
    this.templateContext = {
      $implicit: params.data,
      params: params
    };
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.template = params['ngTemplate'];
    this.refresh(params);
  }
}
