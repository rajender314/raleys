import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-custom-tooltip',
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss']
})
export class CustomTooltipComponent implements ITooltipAngularComp {
  private params: any;
  private data: any;
  public imageViewer: boolean;
  public noData: boolean;
  public fieldName: any;
  public pageName: any;
  private getRowNodeId: any;
  constructor(private activatedRoute: ActivatedRoute) {
    this.pageName = this.activatedRoute['routeConfig']['path'];
  }

  agInit(params): void {
    this.params = params;
    this.fieldName = params.column.colId;
    // var rowNode = this.params.api.getRowNode("5ca36b456b7d1d006e4178d9");
    // console.log(rowNode);
    var row = this.params.column.gridApi.getDisplayedRowAtIndex(
      this.params.rowIndex
    );
    this.params.value =
      this.fieldName === 'image' || this.fieldName === 'image_1'
        ? row.data.image
        : this.fieldName === 'logos' || this.fieldName === 'logos_1'
        ? row.data.logos
        : row.data.icon_path;
    if (
      this.fieldName === 'image' ||
      this.fieldName === 'logos' ||
      this.fieldName === 'icon_path' ||
      this.fieldName === 'image_1' || // this comparision is for page(base/version page's promotion  (2ng grid))
      this.fieldName === 'logos_1' ||
      this.fieldName === 'icon_path_1'
    ) {
      let image_details =
        this.fieldName === 'image' || this.fieldName === 'image_1'
          ? 'image_details'
          : this.fieldName === 'logos' || this.fieldName === 'logos_1'
          ? 'logo_details'
          : 'icons';
      if (
        this.params.column.gridApi.rowModel.rowsToDisplay[this.params.rowIndex]
          .data[image_details].length
      ) {
        this.imageViewer = true;
        // this.noData = false;
      } else {
        if (this.pageName === 'base-versions') {
          // only when we are in base-versions page we not showing any message like add ... as in other pages
          this.noData = false;
        } else {
          this.noData = true;
        }
      }
    } else {
      this.imageViewer = false;
      this.noData = false;
    }
  }
}
