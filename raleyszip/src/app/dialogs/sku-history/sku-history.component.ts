import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
@Component({
  selector: 'app-sku-history',
  templateUrl: './sku-history.component.html',
  styleUrls: ['./sku-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SkuHistoryComponent implements OnInit {
  public historyData: any;
  public params = {
    pageNumber: 1,
    pageSize: 10
  };
  constructor(
    private dialogRef: MatDialogRef<SkuHistoryComponent>,
    private settingsService: SettingsService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.historyData = this.data.history;
  }
  onScrollDown() {
    const val = this.data.count / this.params.pageSize;
    if (this.params.pageNumber < val) {
      this.params.pageNumber = this.params.pageNumber + 1;
      this.updateData();
    }
  }
  updateData() {
    this.settingsService.getSkuHistory(this.data.api, this.params).then(res => {
      if (res.result.success) {
        this.historyData = this.historyData.concat(res.result.data.data);
      }
    });
  }
  closeDialog = () => {
    this.dialogRef.close();
  };
}
