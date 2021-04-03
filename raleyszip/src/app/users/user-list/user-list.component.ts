import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray
} from '@angular/forms';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { UsersService } from '../users.service';
import { UserFiltersComponent } from '../user-filters/user-filters.component';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('leftAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class UserListComponent implements OnInit {
  public dialogRef: any;
  public usersList: any;
  public userData: any;
  public tempUserData: any;
  public permissions = [];
  public permissions2 = [];
  public tempPermissions: any;
  public divisionsList = [];
  public departmentsList = [];
  public formData: any;
  public slected_logo: any;
  public selectedItem: any;
  public allExpandState: boolean = false;
  public isValid: boolean;
  userLoad = true;
  noUsers = true;
  noData = false;
  public edit: any;
  public submitted = false;
  public formSubmitted = false;
  public selectAllDivisions: any;
  public tempselectAllDivisions: any;
  userId: any;
  public companies = [];
  public userTypes = [];
  public userPermissions: any;
  public tempDivisions: any;
  public tempDepartments: any;
  public showDetail = false;
  public isFilterApplied = false;
  public userFilterData: any;
  public tabData: any;
  public submitPermissions = false;
  public validFormData;
  public updatedDivisionsList = [];
  public updatedDepartmentsList = [];
  public updatedRolesList = [];
  public saveBtnInfo = 'Save';
  public default_user_img =
    'resources/assets/js/web/src/assets/images/default-user.png';
  public filterIcon = APP.img_url + 'filter-page.png';
  public search = {
    placeHolder: 'Search User',
    value: ''
  };
  public addEditUsrPer;
  public showOldData: boolean;
  public statusList = [{ name: 'Active', id: 1 }, { name: 'Inactive', id: 2 }];

  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    protected localStorage: LocalStorage,
    private appService: AppService
  ) {
    activeRoute.params.subscribe(param => {
      if (param.id) {
        this.userId = param.id;
        this.showOldData = true;
      }
    });

    this.userService.enableSave.subscribe(data => {
      this.submitPermissions = data.edit;
      this.edit = data.edit;
      // this.isValid = data.edit;
    });
  }

  ngOnInit() {
    if (!this.appService.configLabels.length) {
      let sysVals = JSON.parse(APP.systemSettings);
      let i = _.findIndex(sysVals, {
        key: 'Top-Headers'
      });
      this.appService.configLabels = i > -1 ? sysVals[i].value : [];
    }
    this.getUsers();
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'USERS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
      } else {
        this.addEditUsrPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['ADD_EDIT_USERS']
          : true;
        this.tabData = this.appService.getListData('Top-Headers', 'USERS');

        // this.getHeaderPermissions();
        this.getUserTypesAndCompanies();
      }
    }
  }

  getUsers() {
    if (localStorage.getItem('user_search')) {
      this.search.value = localStorage.getItem('user_search');
    }
    if (
      localStorage.getItem('user_role') ||
      localStorage.getItem('company') ||
      localStorage.getItem('status')
    ) {
      this.isFilterApplied = true;
    } else {
      this.isFilterApplied = false;
    }

    let statusVal = localStorage.getItem('status')
      ? localStorage.getItem('status').split(',')
      : [];
    let statusValueFormatted = [];
    if (statusVal.length) {
      var i = 0;
      statusVal.forEach(val => {
        statusValueFormatted[i] = parseInt(val);
        i++;
      });
    }
    this.userService
      .getUsers({
        search: this.search.value,
        user_role: localStorage.getItem('user_role')
          ? localStorage.getItem('user_role').split(',')
          : [],
        company: localStorage.getItem('company')
          ? localStorage.getItem('company').split(',')
          : [],
        status: statusValueFormatted
      })
      .then(res => {
        this.usersList = res.result.data;

        this.noUsers = false;
        if (this.usersList.length) {
          this.noData = false;
        } else {
          this.noData = true;
        }
        let i = _.findIndex(this.usersList, { id: this.userId });
        this.showOldData
          ? i > -1
            ? this.userChange(this.usersList[i])
            : this.userChange(this.usersList[0])
          : this.userChange(this.usersList[0]);
      });
  }

  getPermissions() {
    this.userService.getUserPermissions({ id: this.userData.id }).then(res => {
      this.permissions = res.result.data;
      this.permissions2 = this.permissions;
      let perms = [
        { name: 'USER PERMISSIONS', level: 1, children: this.permissions }
      ];
      this.permissions = perms;
      this.userService.userPermissionData = this.permissions;
    });
  }

  getUserTypesAndCompanies() {
    return this.userService
      .getUserTypesAndCompanies({ status: [1] })
      .then(res => {
        this.userTypes = res.result.data.userTypes;
        this.companies = res.result.data.companies;
      });
  }

  getHeaderPermissions() {
    this.userService.getHeaderPermissions({}).then(res => {
      if (res.success) {
        // this.divisions = res;
      }
    });
  }
  getDivisions() {
    this.userService
      .getDivisions({ user_id: this.userData.id, format: 1 })
      .then(res => {
        this.divisionsList = res.result.data.data;
      });
  }

  getDepartments() {
    this.userService
      .getDepartments({ user_id: this.userData.id, format: 1 })
      .then(res => {
        this.departmentsList = res.result.data.data;
      });
  }

  getSelectedDivisions(dept) {}

  isChildDivisionChecked(flag) {
    let selectedDivisions;
    this.userData.divisions = this.userData.divisions
      ? this.userData.divisions
      : {};
    this.userData.department = this.userData.department
      ? this.userData.department
      : {};
    if (this.divisionsList) {
      selectedDivisions = this.divisionsList.filter(
        function(value, index) {
          if (flag) {
            _.map(
              value.departments,
              function(dept, index) {
                if (this.userData.divisions[value.id]) {
                  this.userData.department[dept.id] = true;
                } else {
                  this.userData.department[dept.id] = false;
                }
              }.bind(this)
            );
          } else {
            if (this.userData.divisions[value.id]) {
              return true;
            } else {
              return false;
            }
          }
          return this.userData.divisions[value.id] ? true : false;
        }.bind(this)
      );
      this.selectAllDivisions =
        selectedDivisions.length == this.divisionsList.length ? true : false;
    }
  }

  checkAllDivisions() {
    this.edit = true;
    this.userData.divisions = this.userData.divisions
      ? this.userData.divisions
      : {};
    this.userData.department = this.userData.department
      ? this.userData.department
      : {};
    this.divisionsList.map(
      function(division, index) {
        this.userData.divisions[division.id] = this.selectAllDivisions;
        _.map(
          division.departments,
          function(dept, index) {
            this.userData.department[dept.id] = this.selectAllDivisions;
          }.bind(this)
        );
      }.bind(this)
    );
  }

  checkChildDivision = function() {
    // this.changeUserDetails();

    this.edit = true;
    this.isChildDivisionChecked('all');
  };

  checkChildDepartment(div) {
    this.edit = true;
  }

  formValue(data) {
    this.formData = data;
    // this.edit = data.edit;
    this.formSubmitted = data.submitted;
    if (this.formSubmitted) {
      this.submitPermissions = true;
    } else {
      this.submitPermissions = false;
    }
  }

  formSubmitFlag(data) {
    this.edit = data.edit;
    this.validFormData = data.form;
    this.isValid = data.form.valid;
  }

  userChange(user) {
    this.edit = false;
    this.allExpandState = false;
    if (!user) {
      return false;
    }
    if (user) {
      this.userData = user;
      this.userLoad = false;
      this.router.navigateByUrl('users/' + this.userData.id);
      this.tempUserData = Object.assign({}, this.userData);
      this.getPermissions();
      // this.getDivisions();
      this.getDepartments();
      this.isChildDivisionChecked('');
      this.showOldData = false;
    }
  }

  showDetails() {
    this.showDetail = true;
  }

  hideDetails() {
    this.showDetail = false;
  }

  onSearch(event: any): void {
    this.search.value = event;
    this.search.value ? '' : (this.showOldData = false);
    localStorage.setItem('user_search', this.search.value);
    this.getUsers();
  }

  userLogo(data: any) {
    this.selectedItem = data;
    if (data.id) {
      this.usersList.map(userName => {
        if (userName.id === data.id) {
          userName.cloud_path = data.logo;
        }
      });
    }
  }

  update() {
    this.submitted = true;
  }

  updateUserData(): void {
    if (this.updatedDivisionsList.length < 1) {
      this.updatedDivisionsList = this.divisionsList;
    }
    if (this.updatedRolesList.length < 1) {
      this.updatedRolesList = this.permissions2;
    }
    if (this.formSubmitted && this.submitPermissions) {
      this.saveBtnInfo = 'Saving';
      this.submitted = true;
      let params = {},
        divisions = [],
        department = [],
        permissions = [];
      // this.permissions.map(value => {
      //   value.children.map(value1 => {
      //     if (value1.selectedValue) {
      //       permissions[value1.selectedValue] = true;
      //     } else {
      //       value1.children.map(value2 => {
      //         if (value2.checked) {
      //           permissions[value2._id] = true;
      //         }
      //         if (value2.children) {
      //           value2.children.map(value3 => {
      //             if (value3.checked) {
      //               permissions[value3._id] = true;
      //             }
      //           });
      //         }
      //       });
      //     }
      //   });
      // });

      // for (let i in this.userData.divisions) {
      //   if (this.userData.divisions[i]) {
      //     divisions[i] = this.userData.divisions[i];
      //   }
      // }
      this.updatedDivisionsList.map(parent => {
        parent.children.map(value => {
          if (value.checked == 'true' || value.checked == true) {
            divisions.push(value.id);
          }
        });
      });

      this.updatedDepartmentsList.map(parent => {
        parent.children.map(value => {
          if (value.checked == 'true' || value.checked == true) {
            department.push(value.id);
          }
        });
      });

      this.updatedRolesList.map(parent => {
        parent.children.map(value => {
          if (value.checked == 'true' || value.checked == true) {
            permissions.push(value.id);
          }
        });
      });

      // for (let i in this.userData.department) {
      //   if (this.userData.department[i]) {
      //     department[i] = this.userData.department[i];
      //   }
      // }

      this.userService
        .saveUser({
          firstname: this.formData.formValues.firstname,
          lastname: this.formData.formValues.lastname,
          designation: this.formData.formValues.designation,
          user_types_id: this.formData.formValues.user_types_id,
          company: this.formData.formValues.company,
          status: this.formData.formValues.status === 'true' ? 1 : 2,
          id: this.formData.formValues.id,
          email: this.formData.formValues.email,
          divisions: divisions,
          department: department,
          permissions: permissions
        })
        .then(res => {
          if (res.result.success) {
            this.saveBtnInfo = 'Save';
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'User Details Updated Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            let app = JSON.parse(APP['loginDetails']);
            const userData = app.user_data;
            if (this.formData.formValues.id === userData.id) {
              this.appService.getHeaderPermissions().then(res => {
                this.appService.headerPermissions = res.result.data;
                this.addEditUsrPer = this.appService.headerPermissions
                  ? this.appService.headerPermissions['ADD_EDIT_USERS']
                  : true;
              });
              this.appService.getLabels({}).then(res => {
                this.appService.totalConfigData = res.result.data;
                this.appService.configData.next(res.result);
              });
              this.appService.configData.subscribe(config => {
                config.data.map(tabs => {
                  if (tabs.key === 'Top-Headers') {
                    this.appService.configLabels = tabs.value;
                  } else if (tabs.key === 'Others') {
                    this.appService.subHeaders = tabs.value;
                  }
                });
              });
            }
            this.edit = false;
            this.tempUserData = Object.assign({}, this.userData);
            // this.userChange(res.result.data);

            // this.userData.cloud_path = this.slected_logo;
            this.showOldData = true;
            this.userId = res.result.data.id;
            this.getUsers();
            this.submitted = false;
            // this.state.contact_profile = res.result.data;
            // this.createForm();
          } else {
            this.submitted = false;
            // this.resetUserData();
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.edit = false;
          }
        });
    }
  }

  resetUserData() {
    this.userData = Object.assign({}, this.tempUserData);
    // this.permissions = this.tempPermissions;
    // this.tempDivisions = Object.assign({}, this.tempUserData.divisions);
    // this.tempDepartments = Object.assign({}, this.tempUserData.department);
    // this.isChildDivisionChecked('');
    this.checkChildDivision();
    this.checkAllDivisions();
    this.userChange(this.userData);
    this.edit = false;
    this.isValid = true;
    // this.panelOpenState = false;
  }

  addUser() {
    this.dialogRef = this.dialog.open(AddUserComponent, {
      panelClass: ['my-dialog', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Add New User',
        searchForm: [
          {
            name: 'firstname',
            type: 'text',
            required: true,
            label: 'First Name',
            value: ''
          },
          {
            name: 'lastname',
            type: 'text',
            required: true,
            label: 'Last Name',
            value: ''
          },
          {
            name: 'email',
            type: 'email',
            required: true,
            label: 'Email Address',
            value: ''
          },
          {
            name: 'designation',
            type: 'text',
            required: false,
            label: 'Designation',
            value: ''
          },
          {
            name: 'user_types_id',
            type: 'select',
            required: true,
            label: 'User Role',
            value: '',
            options: 'userTypes'
          },
          {
            name: 'company',
            type: 'select',
            required: true,
            label: 'Company',
            value: '',
            options: 'companies'
          }
        ],
        userTypes: this.userTypes,
        companies: this.companies,
        statusList: this.statusList
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.search.value = '';
        localStorage.setItem('user_search', this.search.value);
        this.showOldData = true;
        this.userId = result.data.id;
        this.getUsers();
        this.userData = result.data;
      } else if (result && result.reload) {
        // this.getUsersList();
      }
    });
  }

  userFilters() {
    this.dialogRef = this.dialog.open(UserFiltersComponent, {
      panelClass: ['my-dialog', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Filters',
        search: this.search.value,
        searchForm: [
          {
            name: 'user_types_id',
            type: 'auto-suggest',
            required: false,
            label: 'User Role',
            value: '',
            options: 'userTypes'
          },
          {
            name: 'company',
            type: 'auto-suggest',
            required: false,
            label: 'Company',
            value: '',
            options: 'companies'
          },
          {
            name: 'status',
            type: 'auto-suggest',
            required: false,
            label: 'Status',
            value: '',
            options: 'statusList'
          }
        ],

        userTypes: this.userTypes,
        companies: this.companies,
        statusList: this.statusList,
        user_types_id: localStorage.getItem('user_role')
          ? localStorage.getItem('user_role')
          : [],
        company: localStorage.getItem('company')
          ? localStorage.getItem('company')
          : [],
        status: localStorage.getItem('status')
          ? localStorage.getItem('status')
          : []
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.success) {
        this.userFilterData = result.formValue;
        this.usersList = result.data.data;
        this.isFilterApplied = true;
        localStorage.setItem('user_role', this.userFilterData.user_role);
        localStorage.setItem('company', this.userFilterData.company);
        localStorage.setItem('status', this.userFilterData.status);
        localStorage.setItem('users_filter', '1');
        if (!this.usersList.length) {
          this.noData = true;
        } else {
          this.noData = false;
          this.userChange(this.usersList[0]);
        }
      } else if (result && result.reload) {
      }
    });
  }

  clearFilters() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('company');
    localStorage.removeItem('status');
    this.getUsers();
    this.isFilterApplied = false;
  }

  updatedDivsionsList(event) {
    this.edit = true;
    this.updatedDivisionsList = event.value;
  }

  updatedDepartmentList(event) {
    this.edit = true;
    this.updatedDepartmentsList = event.value;
  }

  updatedRolePermissions(event) {
    this.edit = true;
    this.updatedRolesList = event.value;
  }
}
