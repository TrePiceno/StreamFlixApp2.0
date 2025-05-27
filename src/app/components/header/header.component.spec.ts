import { HeaderComponent } from './header.component';
import { BehaviorSubject } from 'rxjs';

const authServiceMock = {
  currentUser: new BehaviorSubject<any>(null),
  logout: jasmine.createSpy('logout'),
};

const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

describe('HeaderComponent (Class Logic Tests)', () => {

  let component: HeaderComponent;

  beforeEach(() => {

    authServiceMock.logout.calls.reset();
    routerMock.navigate.calls.reset();
    authServiceMock.currentUser = new BehaviorSubject<any>(null);
    component = new HeaderComponent(authServiceMock as any, routerMock as any);

  });

  afterEach(() => {

    component.ngOnDestroy();

  });

  it('logout should call authService.logout and router.navigate', () => {

    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);

  });

  it('should update userName when authService.currentUser emits user', () => {

    const testUser = { userId: 1, username: 'testuser' };
    expect(component.userName).toBeNull();
    authServiceMock.currentUser.next(testUser);
    expect(component.userName).toBe(testUser.username);

  });

  it('should set userName to null when authService.currentUser emits null', () => {

    const testUser = { userId: 1, username: 'testuser' };
    authServiceMock.currentUser.next(testUser);
    expect(component.userName).toBe(testUser.username);
    authServiceMock.currentUser.next(null);
    expect(component.userName).toBeNull();

  });

});
