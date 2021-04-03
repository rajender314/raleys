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
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminLoginComponent implements OnInit {
  public image = APP.img_url + 'omini-offer.png';
  public url = APP.api_url;
  public backgroundImg = APP.img_url + 'background.png';
  // public emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  public emailPattern = /^\w+(\.\w+)*@[a-zA-Z]+\.[a-zA-Z]{2,6}$/;
  public loginForm: FormGroup;
  public error: any;
  public remember: any;

  public state = {
    submitted: false,
    loginDetails: [
      {
        name: 'email',
        type: 'email',
        required: true,
        label: 'Email Address',
        value: ''
      },
      {
        name: 'password',
        type: 'password',
        required: true,
        label: 'Password',
        value: ''
      }
    ]
  };
  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required]],
      remember: 'false'
    });
  }

  submit(form) {
    this.state.submitted = true;
    if (form.valid) {
      this.loginService
        .getLogin({
          username: form.value.email,
          password: form.value.password,
          timezone: new Date().getTimezoneOffset(),
          remember: form.value.remember
        })
        .then(res => {
          if (res.result.success) {
            this.router.navigateByUrl('/users');
            location.reload();
            this.state.submitted = false;
          } else {
            this.error = res.result.message;
          }
        });
    }
  }

  valuechange(e) {
    this.error = '';
  }
}
