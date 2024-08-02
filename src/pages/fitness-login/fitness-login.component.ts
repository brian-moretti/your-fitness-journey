import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SHARED_COMPONENTS } from '..';
import { PRIMENG_COMPONENTS } from '../../core/library/primeng-index';
import { IUserGet } from '../../core/model/interface/user';
import { AuthService } from '../../services/auth/auth.service';
import { LoginService } from '../../services/login/login.service';

@Component({
  standalone: true,
  imports: [...SHARED_COMPONENTS, ...PRIMENG_COMPONENTS, ReactiveFormsModule],
  templateUrl: './fitness-login.component.html',
  styleUrl: './fitness-login.component.scss',
})
export class FitnessLoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private router: Router,
    private login: LoginService,
    private guard: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl<string>('', Validators.required),
      email: new FormControl<string>('', [
        Validators.email,
        Validators.required,
      ]),
      password: new FormControl<string>('', Validators.required),
    });
  }

  get usernameControl() {
    return this.loginForm.get('username') as FormControl;
  }
  get emailControl() {
    return this.loginForm.get('email') as FormControl;
  }
  get passwordControl() {
    return this.loginForm.get('password') as FormControl;
  }

  onLoginSubmit(form: FormGroup) {
    const loginForm = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    };
    this.login.loginUserUsingPost(loginForm).subscribe({
      next: (users: IUserGet[]) => {
        const account = users.find(
          (user) =>
            user.username === loginForm.username &&
            user.email === loginForm.email
        );
        //! METODO GETUSER CON ID ACCOUNT.ID
        if (account) {
          this.guard.isLoginStorage(account);
          this.router.navigate(['dashboard']);
        }
      },
      error: () => {},
    });
  }
}
