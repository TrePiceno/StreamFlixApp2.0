import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginSuccessResponse } from '../../models/user.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  };

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl || '/catalog']);
    };

  };

  get f() {
    return this.loginForm.controls;
  };

  onSubmit(): void {
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    };

    this.loading = true;

    this.apiService
      .login(this.loginForm.value)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error =
            err.error?.message || 'Error en el servidor. Inténtalo de nuevo.';
          return of(null);
        })
      )
      .subscribe(
        (response: LoginSuccessResponse | null) => {
          this.loading = false;
          if (response) {
            this.authService.login({
              userId: response.userId,
              username: response.username,
            });

            this.router.navigate([this.returnUrl || '/catalog']);
          };

        }

      );
  };

};
