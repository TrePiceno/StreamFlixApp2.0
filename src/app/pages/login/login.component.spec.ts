import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

const apiServiceMock = {
  login: jasmine.createSpy('login').and.returnValue(of({}))
};

const authServiceMock = {
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
  login: jasmine.createSpy('login'),
};

const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

const activatedRouteMock = {
  snapshot: {
    queryParamMap: {
      get: jasmine.createSpy('get').and.returnValue(null),
    },
  },
};



describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    apiServiceMock.login.calls.reset();
    authServiceMock.isAuthenticated.calls.reset();
    authServiceMock.login.calls.reset();
    routerMock.navigate.calls.reset();
    activatedRouteMock.snapshot.queryParamMap.get.calls.reset();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty fields and be invalid', () => {

    expect(component.loginForm).toBeTruthy();

    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();

    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');

    expect(component.loginForm.valid).toBeFalse();
  });

  it('should be valid when fields are filled', () => {

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123',
    });

    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not call apiService.login if form is invalid', () => {

    expect(component.loginForm.invalid).toBeTrue();

    component.onSubmit();

    expect(apiServiceMock.login).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');

  });

  it('should set loading to true and clear error on valid submit', () => {

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123',
    });

    expect(component.loginForm.valid).toBeTrue();

    component.error = 'Some previous error';
    expect(component.loading).toBeFalse();

    component.onSubmit();
    expect(component.error).toBe('');

  });

  it('should call apiService.login with form values on valid submit', () => {
    const testUsername = 'user_api';
    const testPassword = 'password_api';
    component.loginForm.patchValue({
      username: testUsername,
      password: testPassword,
    });

    expect(component.loginForm.valid).toBeTrue();

    expect(apiServiceMock.login).not.toHaveBeenCalled();

    component.onSubmit();

    expect(apiServiceMock.login).toHaveBeenCalled();
    expect(apiServiceMock.login).toHaveBeenCalledTimes(1);
    expect(apiServiceMock.login).toHaveBeenCalledWith({
      username: testUsername,
      password: testPassword,
    });

  });

  it('should handle successful login response', fakeAsync(() => {

    const testUser = { userId: 1, username: 'testuser' };
    const formValues = { username: 'test', password: 'test' };

    component.loginForm.patchValue(formValues);
    expect(component.loginForm.valid).toBeTrue();

    apiServiceMock.login.and.returnValue(of(testUser));
    component.loading = false;
    component.error = 'Previous error';
    component.onSubmit();

    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(authServiceMock.login).toHaveBeenCalled();
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(authServiceMock.login).toHaveBeenCalledWith(testUser);
    expect(routerMock.navigate).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/catalog']);
  }));

  it('should handle login error response', fakeAsync(() => {
    const formValues = { username: 'test', password: 'test' };
    component.loginForm.patchValue(formValues);
    expect(component.loginForm.valid).toBeTrue();
    const apiErrorResponse = {
      error: { message: 'Invalid credentials' },
      status: 401,
    };

    apiServiceMock.login.and.returnValue(throwError(() => apiErrorResponse));

    component.loading = false; 
    component.error = '';
    component.onSubmit();

    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe(apiErrorResponse.error.message);

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  })
);

});
