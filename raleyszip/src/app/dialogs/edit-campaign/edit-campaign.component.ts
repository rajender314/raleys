import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDatepicker
} from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CampaignsService } from '@app/campaigns/campaigns.service';

@Component({
  selector: 'app-edit-campaign',
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.scss']
})
export class EditCampaignComponent implements OnInit {
  structureValues: FormGroup;
  public editListForm: any;
  public headersData: any;
  public settingsListForm: any;
  public statusList: any;
  public selectedRow: any;
  public listData: any;
  public eventTypes = [];
  public campaignData = [];
  public btnState: boolean;
  public statusValue: any;
  public statusAct: boolean;
  public statusInactive: boolean;
  public submitted = false;
  public dataLoad = true;
  public minDate = {
    start_date: '',
    end_date: ''
  };
  public maxDate = {
    start_date: '',
    end_date: ''
  };
  public errorMsg = '';
  constructor(
    public dialogRef: MatDialogRef<EditCampaignComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public campaignService: CampaignsService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.headersData = this.data.headersData;
    this.editListForm = this.data.editListForm;
    this.selectedRow = this.data.selectedRow;
    this.campaignData = this.data.campaignData ? this.data.campaignData : '';
    this.eventTypes = this.data.eventTypes ? this.data.eventTypes : '';
    this.dataLoad = false;
    const obj = {};
    this.statusValue =
      this.data.title === 'Event'
        ? this.data.editListForm.value.editFormValues[6].status
        : this.data.editListForm.value.editFormValues[4].status;
    this.statusAct = this.statusValue === 1 ? this.statusValue : false;
    this.statusAct = this.statusValue === 2 ? this.statusValue : false;
    this.statusInactive = this.statusValue === 1 ? false : this.statusValue;
    if (this.selectedRow) {
      this.minDate['end_date'] = moment(this.selectedRow['start_date']).add(
        1,
        'days'
      )['_d'];
      this.maxDate['start_date'] = moment(
        this.selectedRow['end_date']
      ).subtract(1, 'days')['_d'];
      this.minDate['start_date'] = '';
    } else {
      this.minDate['start_date'] = moment(new Date())['_d'];
    }
  }

  close = () => {
    this.dialogRef.close();
    this.editListForm.reset();
  };

  update(form) {
    this.submitted = true;
    const obj = {};
    obj['id'] = this.data.mode !== 'create' ? this.selectedRow.id : '';
    form.value.editFormValues.forEach(item => {
      Object.assign(obj, item);
    });
    if (form.valid) {
      this.dataLoad = true;
      this.data.section.map(attr => {
        if (attr.type === 'date') {
          obj[attr.name] = moment(obj[attr.name]).format('YYYY-MM-DD');
        }
      });

      this.campaignService.createCampaign(obj).then(res => {
        if (res.result.success) {
          setTimeout(() => {
            this.dialogRef.close({ data: form });
          }, 600);
          setTimeout(() => {
            this.dataLoad = false;
          }, 700);
        } else {
          this.errorMsg = res.result.data;
          this.dataLoad = false;
        }
      });
    }
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  dateValueChange(field, event) {
    if (field.name === 'start_date') {
      this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
    }
    if (field.name === 'end_date') {
      this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')[
        '_d'
      ];
    }
  }
  formatDate(param) {
    const date: Date = new Date(param);
    return date.toISOString().substring(0, 10);
  }
}
