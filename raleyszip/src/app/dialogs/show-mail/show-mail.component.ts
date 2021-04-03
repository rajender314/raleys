import { Component, OnInit, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-show-mail',
  templateUrl: './show-mail.component.html',
  styleUrls: ['./show-mail.component.scss']
})
export class ShowMailComponent implements OnInit {
  showMailContent: any;

  constructor(
    private dialogRef: MatDialogRef<ShowMailComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private domSanitizer: DomSanitizer
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.showMailContent = this.domSanitizer.bypassSecurityTrustHtml(
      this.data.data[0].message
    );
  }
}
