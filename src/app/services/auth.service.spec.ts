import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

const sessionStorageMock = {
  getItem: jasmine.createSpy('getItem').and.returnValue(null),
  setItem: jasmine.createSpy('setItem'),
  removeItem: jasmine.createSpy('removeItem'),
  clear: jasmine.createSpy('clear'),
};

describe('AuthService', () => {
  let service: AuthService;
  let mockUserSubject: BehaviorSubject<any>;
  let realSessionStorage: Storage;

  beforeEach(() => {
    realSessionStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
      ]
    });

    service = TestBed.inject(AuthService);
    mockUserSubject = (service as any).currentUserSubject;

    sessionStorageMock.getItem.calls.reset();
    sessionStorageMock.setItem.calls.reset();
    sessionStorageMock.removeItem.calls.reset();
  });
  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: realSessionStorage,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUserValue).toBeNull();
    expect(mockUserSubject.value).toBeNull();
    expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(0);
  });

  it('should be authenticated after login', () => {
    const testUser = { userId: 1, username: 'testuser' };

    service.login(testUser);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUserValue).toEqual(testUser);
    expect(mockUserSubject.value).toEqual(testUser);
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(testUser));

    expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledTimes(0);
    expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(0);
  });

  it('should not be authenticated after logout', () => {
    const testUser = { userId: 1, username: 'testuser' };
    service.login(testUser);

    expect(service.isAuthenticated()).toBeTrue();
    sessionStorageMock.setItem.calls.reset();
    sessionStorageMock.removeItem.calls.reset();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUserValue).toBeNull();
    expect(mockUserSubject.value).toBeNull();
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledTimes(1);
    expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(0);
    expect(sessionStorageMock.getItem).toHaveBeenCalledTimes(0);
  });

  it('should return null userId initially', () => {
    expect(service.getUserId()).toBeNull();
  });

  it('should return userId after login', () => {
    const testUser = { userId: 456, username: 'anotheruser' };
    service.login(testUser);
    expect(service.getUserId()).toBe(testUser.userId);
  });
  
});
