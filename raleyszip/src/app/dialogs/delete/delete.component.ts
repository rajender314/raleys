import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {}

  closeDialog = () => {
    this.dialogRef.close();
  };
  save() {
    this.settingsService.saveApi(this.data.url, this.data.params).then(res => {
      if (res.result.success) {
        this.dialogRef.close({ success: true, data: null });
      }
    });
  }
}
