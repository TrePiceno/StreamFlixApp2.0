import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { User, LoginSuccessResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<LoginSuccessResponse> {
    return this.http.post<LoginSuccessResponse>(
      `${this.apiUrl}/Auth/login`,
      credentials
    );

  };

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Auth/register`, userData);
  };

  getCatalog(
    userId: number | null,
    category?: string,
    genre?: string
  ): Observable<Item[]> {

    let params = new HttpParams();

    if (category) {
      params = params.set('category', category);
    };

    if (genre) {
      params = params.set('genre', genre);
    };

    let headers: any = {};
    if (userId !== null) {
      headers['X-UserId'] = userId.toString();
    };

    return this.http.get<Item[]>(`${this.apiUrl}/Catalog`, { params, headers });
  };

  getItemDetails(userId: number | null, itemId: number): Observable<Item> {
    let headers: any = {};

    if (userId !== null) {
      headers['X-UserId'] = userId.toString();
    };

    return this.http.get<Item>(`${this.apiUrl}/Catalog/${itemId}`, { headers });
  };

  getUserFavorites(userId: number): Observable<Item[]> {
    const url = `${this.apiUrl}/Favorites/${userId}`;
    console.log('GET Favorites Request URL:', url);
    return this.http.get<Item[]>(url);
  };

  addFavorite(userId: number, itemId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Favorites`, { userId, itemId });
  };

  removeFavorite(userId: number, itemId: number): Observable<any> {
    const url = `${this.apiUrl}/Favorites/${userId}/${itemId}`;

    return this.http.delete<any>(url);
  };

};
