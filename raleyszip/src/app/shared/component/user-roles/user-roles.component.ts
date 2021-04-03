import {
  Component,
  OnInit,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { SettingsService } from '@app/settings/settings.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserRolesComponent implements OnInit, OnChanges {
  @Input() userRoles;
  @Output() updatedValues = new EventEmitter();

  public userRolesForm: FormGroup;
  public userRolePermissions = [];
  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
    this.userRolePermissions = changes.userRoles.currentValue;
    if (this.userRolePermissions && this.userRolePermissions.length) {
      this.generateDynamicFields();
    }
  }

  createForm() {
    this.userRolesForm = this.fb.group({
      dynamicFields: this.fb.array([])
    });
  }

  generateDynamicFields() {
    let formArray = this.userRolesForm.get('dynamicFields') as FormArray;
    formArray.controls = [];
    this.userRolePermissions.forEach(data => {
      const childArray = [];
      data.children.forEach(child => {
        childArray.push(this.generateChildGroup(child));
      });

      formArray.push(
        this.fb.group({
          label: data.label,
          children: this.fb.array(childArray),
          code: data.code,
          id: data.id
        })
      );
    });
  }

  generateChildGroup(group) {
    return this.fb.group({
      checked: group.checked.toString(),
      code: group.code,
      id: group.id,
      label: group.label,
      status: group.status
    });
  }

  public get formArray() {
    return this.userRolesForm.get('dynamicFields') as FormArray;
  }

  updateUserRole(form) {}

  onToggleChange(allControls) {
    this.updatedValues.emit(allControls);
  }
}
