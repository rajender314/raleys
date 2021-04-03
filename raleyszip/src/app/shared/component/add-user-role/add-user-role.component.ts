import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';
@Component({
  selector: 'app-add-user-role',
  templateUrl: './add-user-role.component.html',
  styleUrls: ['./add-user-role.component.scss']
})
export class AddUserRoleComponent implements OnInit {
  public addUserRoleForm: FormGroup;
  public addRoleProgress = false;

  public statusOptions = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Inactive' }
  ];
  public submitted = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserRoleComponent>,
    private settingsService: SettingsService,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.addUserRoleForm = this.fb.group({
      name: ['', Validators.required],
      description: '',
      status: ['', Validators.required]
    });
    this.setDeafultValues();
  }

  setDeafultValues() {
    this.addUserRoleForm.controls['status'].setValue(1);
  }

  close() {
    this.dialogRef.close();
  }

  saveUserRole(form) {
    this.submitted = true;
    if (form.valid) {
      this.addRoleProgress = true;
      this.settingsService.sendOuput('createRole', form.value).then(res => {
        if (res.result.success) {
          this.dialogRef.close({ res });
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'User Role Created Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
        this.addRoleProgress = false;
      });
    }
  }
}
