import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { LoginService } from '../login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PixelKitModule } from 'pixel-kit';
import * as _ from 'lodash';

const APP: any = window['APP'];

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {
  public image = APP.img_url + 'omini-offer.png';
  public backgroundImg = APP.img_url + 'background.png';
  public successImg = APP.img_url + 'tick_green@2x.png';
  // public emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  public emailPattern = /^\w+(\.\w+)*@[a-zA-Z]+\.[a-zA-Z]{2,6}$/;
  public forgotPasswordForm: FormGroup;
  public error: any;
  public successMsg: any;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]]
    });
  }

  send(form) {
    if (form.valid) {
      this.loginService
        .forgotPassword({ email: form.value.email })
        .then(res => {
          if (res.result.success) {
            this.successMsg = res.result.message;
            // this.state.submitted = false;
          } else {
            this.error = res.result.message;
          }
        });
    }
  }
  editUser(details) {
    //details of user
  }

  valuechange(e) {
    this.error = '';
  }
}
