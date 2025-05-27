import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service'; 

const authServiceMock = {
  isAuthenticated: jasmine.createSpy('isAuthenticated'),
};

const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let routeMock: ActivatedRouteSnapshot;
  let stateMock: RouterStateSnapshot;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });


    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    routeMock = {} as ActivatedRouteSnapshot;
    stateMock = { url: '/some-protected-route' } as RouterStateSnapshot;


    authService.isAuthenticated.calls.reset();
    router.navigate.calls.reset();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation if user is authenticated', () => {

    authService.isAuthenticated.and.returnValue(true);

    const result = executeGuard(routeMock, stateMock);

    expect(result).toBeTrue();
    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

  });

  it('should deny activation and redirect to login if user is not authenticated', () => {

    authService.isAuthenticated.and.returnValue(false);

    const result = executeGuard(routeMock, stateMock);

    expect(result).toBeFalse();
    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: stateMock.url },
    });
    expect(router.navigate).toHaveBeenCalledTimes(1);
    
  });
  
});