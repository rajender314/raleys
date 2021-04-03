import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
@Component({
  selector: 'app-confirm-edit-label',
  templateUrl: './confirm-edit-label.component.html',
  styleUrls: ['./confirm-edit-label.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmEditLabelComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<ConfirmEditLabelComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private settingsService: SettingsService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {}

  closeDialog = () => {
    this.dialogRef.close();
  };

  save() {
    this.settingsService
      .updateLabel({
        value: this.data.configData.value,
        id: this.data.configData.id
      })
      .then(res => {
        if (res.result.success) {
          this.dialogRef.close(res.result);
        }
      });
  }
}
