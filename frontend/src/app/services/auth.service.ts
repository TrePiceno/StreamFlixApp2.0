import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private readonly USER_STORAGE_KEY = 'currentUser';

  constructor() {
    const storedUser = sessionStorage.getItem(this.USER_STORAGE_KEY);
    const initialUser: User | null = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser = this.currentUserSubject.asObservable(); 
  };

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  };

  login(user: User): void {
    sessionStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  };

  logout(): void {
    sessionStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
  };

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  };

  getUserId(): number | null {
    return this.currentUserSubject.value?.userId || null;
  };

};
