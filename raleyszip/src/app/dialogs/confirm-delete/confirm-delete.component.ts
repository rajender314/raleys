import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import { AdsService } from '@app/ads/ads.service';
@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDeleteComponent implements OnInit {
  public process = false;
  public mode = 'Delete';
  public errorMsg = '';
  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private settingsService: SettingsService,
    private adsService: AdsService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.mode =
      this.data.mode === 'export'
        ? 'Export'
        : this.data.mode === 'download'
        ? 'Download'
        : this.data.mode === 'import'
        ? 'Import'
        : this.data.mode === 'split-mod'
        ? 'Split Mod'
        : this.data.mode === 'Create Signage'
        ? 'Create Signage'
        : 'Delete';
  }

  closeDialog = () => {
    this.dialogRef.close({ from: 'close' });
  };

  delete() {
    // deleting the previewed images,icons logic from ad-pages click
    this.process = true;
    if (this.mode === 'Split Mod') {
      this.dialogRef.close({ from: 'confirm' });
      return;
    } else if (this.mode === 'Create Signage') {
      this.settingsService
        .deleteItem([
          { url: this.data.rowData.delete_api },
          this.data.selectedRow
        ])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(response.result);
          } else {
            this.errorMsg = response.result.data
              ? response.result.data
              : 'Failed in creating signage';
          }
          this.process = false;
        });
    } else if (
      this.data.mode == 'delete' &&
      this.data.action == 'deltePreviewItems'
    ) {
      this.dialogRef.close({ from: this.data.mode, action: this.data.action });
      return;
    } else if (this.data.mode == 'delete' && this.data.action == 'deleteSpec') {
      this.settingsService
        .deleteItem([
          { url: this.data.rowData.delete_api },
          {
            id: this.data.rowData.data.id,
            form_type: 2,
            is_delete: 1
          }
        ])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(response.result);
          } else {
            this.errorMsg = response.result.data
              ? response.result.data
              : 'Failed in Delteion of specification';
          }
          this.process = false;
        });
    } else if (this.data.mode === 'import') {
      this.dialogRef.close({ from: 'proceed' });
      return;
    }
    // if (this.data.mode === 'split-mod') {
    //   this.adsService
    //     .getAdModules([{ url: 'saveSplitMod' }, this.data.rowData])
    //     .then(res => {
    //       this.dialogRef.close({ from: 'save', result: res });
    //       this.process = false;
    //     });
    //   return;
    // }
    else if (
      this.data.rowData.label === 'Ad Preview' ||
      this.data.rowData.label === 'Ad Report'
    ) {
      // from ad preview page's export btn click function...
      this.adsService.exportAd(this.data.exportObj).then(res => {
        return;
        this.dialogRef.close({ from: 'close1', result: res });
        this.process = false;
      });
    } else {
      this.settingsService
        .deleteItem([
          { url: this.data.rowData.delete_api },
          this.data.selectedRow
        ])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(response.result);
          }
          this.process = false;
        });
    }
  }
}
