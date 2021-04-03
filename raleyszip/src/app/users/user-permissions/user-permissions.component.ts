import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsersService } from '../users.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent implements OnInit {
  public disableCheckbox = false;
  public perData;
  constructor(private userService: UsersService) {}
  @Input() permission;
  @Output() editPermissions = new EventEmitter<any>();

  ngOnInit() {
    this.perData = this.userService.userPermissionData;
  }
  setDirty(): void {
    this.permission.setDirty();
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    this.check(this.permission);
  }

  check(item, ev?, arr?) {
    if (this.perData) {
      if (item.name === 'Add/Edit Ads') {
        const index = _.findIndex(this.perData, { name: 'USER PERMISSIONS' });
        const val = this.perData[index];
        val.children.map(val1 => {
          val1.children.map(val2 => {
            if (item.checked && val2.type === 'checkbox') {
              val2.checked = true;
              if (
                val2.code !== 'Access_toAdd' &&
                val1.name !== 'EVENTS' &&
                val1.type !== 'radio'
              ) {
                val2.disabled = true;
              }
            } else {
              val2.disabled = false;
            }
          });
        });
      } else if (item.children ? item.children.length : false) {
        if (item.checked) {
          item.children.map(val => {
            val.checked = true;
            val.disabled = false;
          });
        } else {
          item.children.map(val => {
            val.disabled = true;
          });
        }
      }

      if (ev) {
        arr.map(o => {
          o.checked = false;
        });
        item.checked = ev.target.checked;
      }
    }
  }

  enableSave(item) {
    this.userService.enableSave.next({ edit: 'true' });
  }
}
