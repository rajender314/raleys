import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef
} from '@angular/core';
import { SettingsService } from '@app/settings/settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddUserRoleComponent } from '@app/shared/component/add-user-role/add-user-role.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
@Component({
  selector: 'app-user-roles2',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserRolesComponent implements OnInit {
  @Input() userRolesList;

  public userRolesForm: FormGroup;
  public userRolePermissions = [];
  public formLoaded: boolean;
  public edit = false;
  public currentRoleId: any;
  public currentRoleInfo: any;
  public updatingUserInfo = false;
  public currentRoleName: any;
  public currentUserRoleId;
  public currentUserRole;
  public one = 1;
  public two = 2;
  public noData = true;
  public loading = true;
  public updatedUserRolesInfo = [];
  public statusOptions = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Inactive' }
  ];
  public search = '';
  @ViewChild('searchingBox') searchingBox: ElementRef;

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private dailog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createForm();
    if (this.userRolesList.userRoles.length) {
      this.noData = false;
      this.setFormValues(this.userRolesList.userRoles[0]);
      this.getPermissions(this.userRolesList.userRoles[0].id);
      this.currentUserRole = this.userRolesList.userRoles[0];
      this.currentRoleId = this.userRolesList.userRoles[0].id;
      this.currentRoleName = this.userRolesList.userRoles[0].name;
      this.currentRoleInfo = this.userRolesList.userRoles[0];
    } else {
      this.noData = true;
    }
    this.loading = false;
  }

  onSearch(event) {
    this.getFilteredRoles(event);
  }

  createForm() {
    this.userRolesForm = this.fb.group({
      name: ['', Validators.required],
      description: '',
      status: ''
    });
  }
  addUserRole() {
    this.searchingBox['searchOpts'].value = '';
    const dialogRef = this.dailog.open(AddUserRoleComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.res.result.success) {
        this.getFilteredRoles('');
      }
    });
  }
  resetUserData() {}
  resetPerData() {
    this.getPermissions(this.currentUserRoleId);
    this.setFormValues(this.currentUserRole);
    this.edit = false;
  }
  setFormValues(userRoles) {
    this.userRolesForm.patchValue({
      name: userRoles.name,
      description: userRoles.description,
      status: userRoles.status
    });
  }

  // to get particular user role permission
  getPermissions(user_role_id) {
    this.currentUserRoleId = user_role_id;
    this.settingsService.getUserRolePermissions(user_role_id).then(res => {
      this.userRolePermissions = res.result.data;
    });
  }

  // from menu side bar, (user role list) item click
  getSelectedUserRole(userRole) {
    this.currentUserRole = userRole;
    this.currentRoleInfo = userRole;
    this.setFormValues(userRole);
    this.getPermissions(userRole.id);
    this.currentRoleId = userRole.id;
    this.currentRoleName = userRole.name;
    this.edit = false;
  }

  // to get filtered user roles
  getFilteredRoles(searchKey) {
    this.loading = true;
    this.settingsService.getFilterdUserRoles(searchKey).then(res => {
      this.userRolesList['userRoles'] = res.result.data.data;
      if (this.userRolesList['userRoles'].length) {
        this.noData = false;
        this.currentRoleInfo = this.userRolesList.userRoles[0];
        this.currentUserRole = this.currentRoleInfo;
        this.setFormValues(this.userRolesList.userRoles[0]);
        this.getPermissions(this.userRolesList.userRoles[0].id);
        this.currentRoleName = this.userRolesList['userRoles'][0].name;
        this.currentRoleId = this.userRolesList['userRoles'][0].id;
        this.valChanged('dontChange');
      } else {
        this.noData = true;
      }
      this.loading = false;
    });
  }

  valChanged(event) {
    if (event != 'dontChange') {
      this.edit = true;
    } else {
      this.edit = false;
    }
  }

  updateUserRole(form) {
    this.edit = false;
    if (form.valid) {
      this.updatingUserInfo = true;
      let permisssionIds = [];
      this.updatedUserRolesInfo.forEach(element => {
        element.children.forEach(control => {
          if (control.checked == 'true') {
            permisssionIds.push(control.id);
          }
        });
      });

      let finalObj = {
        id: this.currentRoleId,
        ...form.value,
        permissions: permisssionIds
      };
      this.settingsService.sendOuput('createRole', finalObj).then(res => {
        this.updatingUserInfo = false;
        if (res.result.success) {
          this.getFilteredRoles('');
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'User Role Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: res.result.data
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
    }
  }

  // emitted event from component controlling here.
  updatedUserRolePermissions(event) {
    this.edit = true;
    this.updatedUserRolesInfo = event.value;
  }

  hideActionBtns() {
    this.edit = false;
  }
}
