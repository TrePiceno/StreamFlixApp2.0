import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FavoritesPageComponent } from './favorites-page.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

const apiServiceMock = {
  getUserFavorites: jasmine
    .createSpy('getUserFavorites')
    .and.returnValue(of([])),
  removeFavorite: jasmine.createSpy('removeFavorite').and.returnValue(of({})),

};

const authServiceMock = {
  getUserId: jasmine.createSpy('getUserId').and.returnValue(123),

};

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent, ConfirmModalComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPageComponent);

    component = fixture.componentInstance;
    component.favoriteItems = [];
    component.loading = true;
    component.error = '';
    component.userId = null;
    component.showConfirmModal = false;
    component.itemToDelete = null;
    component.isDeleting = false;

    apiServiceSpy = TestBed.inject(ApiService) as any;
    authServiceSpy = TestBed.inject(AuthService) as any;

    apiServiceMock.getUserFavorites.calls.reset();
    apiServiceMock.removeFavorite.calls.reset();
    authServiceSpy.getUserId.calls.reset();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set error and loading to false if userId is null', fakeAsync(() => {

    authServiceSpy.getUserId.and.returnValue(null);

    expect(component.error).toBe('');
    expect(component.loading).toBe(true);
    expect(component.userId).toBeNull();
    expect(component.favoriteItems.length).toBe(0);
    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(component.userId).toBeNull();
    expect(component.error).toBe('Usuario no autenticado.');
    expect(component.loading).toBeFalse();
    expect(component.favoriteItems.length).toBe(0);
    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

    tick();

  }));

  it('ngOnInit should get userId and call loadFavorites if userId is not null', fakeAsync(() => {

    const testUserId = 456; 
    authServiceSpy.getUserId.and.returnValue(testUserId);

    const loadFavoritesSpy = spyOn(component, 'loadFavorites');

    expect(component.userId).toBeNull();
    expect(loadFavoritesSpy).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(component.userId).toBe(testUserId);
    expect(authServiceSpy.getUserId).toHaveBeenCalled();
    expect(authServiceSpy.getUserId).toHaveBeenCalledTimes(1);
    expect(loadFavoritesSpy).toHaveBeenCalled();
    expect(loadFavoritesSpy).toHaveBeenCalledTimes(1);
    expect(loadFavoritesSpy).toHaveBeenCalledWith(testUserId);
    expect(component.error).toBe('');
    expect(component.loading).toBeTrue();

    tick();

  }));

  it('loadFavorites should set loading, clear items/error and call apiService.getUserFavorites', fakeAsync(() => {

    const testUserId = 789; 
    component.favoriteItems = [
      { itemId: 99, titulo: 'Dummy Fav', esFavorito: true } as any,
    ];
    component.loading = false;
    component.error = 'Previous Error';

    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

    component.loadFavorites(testUserId);

    expect(component.favoriteItems.length).toBe(0);
    expect(component.error).toBe('');
    expect(apiServiceSpy.getUserFavorites).toHaveBeenCalled();
    expect(apiServiceSpy.getUserFavorites).toHaveBeenCalledTimes(1); 
    expect(apiServiceSpy.getUserFavorites).toHaveBeenCalledWith(testUserId);
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    tick();

  }));

  it('loadFavorites should handle successful apiService.getUserFavorites response', fakeAsync(() => {

    const mockFavoriteItems: Item[] = [
      { itemId: 1, titulo: 'Favorite Item 1', esFavorito: true } as any,
      { itemId: 2, titulo: 'Favorite Item 2', esFavorito: true } as any,
    ];

    apiServiceSpy.getUserFavorites.and.returnValue(of(mockFavoriteItems));


    component.loading = true;
    component.favoriteItems = [];
    component.error = '';

    const testUserId = 123;

    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

    component.loadFavorites(testUserId);

    expect(apiServiceSpy.getUserFavorites).toHaveBeenCalledOnceWith(testUserId);

    tick();

    expect(component.loading).toBeFalse();
    expect(component.favoriteItems).toEqual(mockFavoriteItems);
    expect(component.error).toBe('');

  }));

  it('loadFavorites should handle apiService.getUserFavorites error response', fakeAsync(() => {

    const apiError = {
      error: { message: 'Original API Error Message' },
      status: 500,
    };

    apiServiceSpy.getUserFavorites.and.returnValue(throwError(() => apiError));

    component.loading = true;
    component.favoriteItems = [];
    component.error = '';

    const testUserId = 123; 

    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

    component.loadFavorites(testUserId);

    expect(apiServiceSpy.getUserFavorites).toHaveBeenCalledOnceWith(testUserId);

    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Error al cargar los favoritos. Inténtalo de nuevo.');
    expect(component.favoriteItems.length).toBe(0);

  }));

  it('confirmRemoveFavorite should set itemToDelete and showConfirmModal', () => {

    expect(component.showConfirmModal).toBeFalse();
    expect(component.itemToDelete).toBeNull();
    expect(component.isDeleting).toBeFalse();

    const itemToConfirm = { itemId: 101, titulo: 'Item to Delete' } as Item;

    component.confirmRemoveFavorite(itemToConfirm);

    expect(component.itemToDelete).toBe(itemToConfirm);
    expect(component.showConfirmModal).toBeTrue();
    expect(component.isDeleting).toBeFalse();

  });

  it('confirmRemoveFavorite should do nothing if isDeleting is true', () => {

    component.isDeleting = true;

    const itemToConfirm = { itemId: 101, titulo: 'Item to Delete' } as Item;
    expect(component.showConfirmModal).toBeFalse();
    expect(component.itemToDelete).toBeNull();

    component.confirmRemoveFavorite(itemToConfirm);

    expect(component.itemToDelete).toBeNull();
    expect(component.showConfirmModal).toBeFalse();
    expect(component.isDeleting).toBeTrue();

  });

  it('handleCancellation should set showConfirmModal to false and itemToDelete to null', () => {

    component.showConfirmModal = true;
    component.itemToDelete = { itemId: 101, titulo: 'Item to Delete' } as Item;

    expect(component.showConfirmModal).toBeTrue();
    expect(component.itemToDelete).not.toBeNull();

    component.handleCancellation();

    expect(component.showConfirmModal).toBeFalse();
    expect(component.itemToDelete).toBeNull();
    expect(component.isDeleting).toBeFalse();

  });

  it('handleConfirmation should call handleCancellation if confirmed is false', () => {

    spyOn(component, 'handleCancellation');

    const confirmed = false;

    component.itemToDelete = { itemId: 101, titulo: 'Item to Delete' } as Item;
    component.userId = 123; 
    component.handleConfirmation(confirmed);

    expect(component.handleCancellation).toHaveBeenCalled();
    expect(component.handleCancellation).toHaveBeenCalledTimes(1);

  });

  it('handleConfirmation should call handleCancellation if confirmed is true but itemToDelete is null', () => {

    spyOn(component, 'handleCancellation');
    spyOn(component, 'deleteFavorite');

    const confirmed = true;
    component.itemToDelete = null;
    component.userId = 123;
    component.handleConfirmation(confirmed);

    expect(component.handleCancellation).toHaveBeenCalled();
    expect(component.handleCancellation).toHaveBeenCalledTimes(1);

    expect(component.deleteFavorite).not.toHaveBeenCalled();

  });

  it('handleConfirmation should call handleCancellation if confirmed is true but userId is null', () => {

    spyOn(component, 'handleCancellation');
    spyOn(component, 'deleteFavorite');

    const confirmed = true;

    component.itemToDelete = { itemId: 101, titulo: 'Item to Delete' } as Item;
    component.userId = null;
    component.handleConfirmation(confirmed);

    expect(component.handleCancellation).toHaveBeenCalled();
    expect(component.handleCancellation).toHaveBeenCalledTimes(1);
    expect(component.deleteFavorite).not.toHaveBeenCalled();

  });

  it('handleConfirmation should call deleteFavorite if confirmed is true and itemToDelete and userId are not null', () => {

    const deleteFavoriteSpy = spyOn(component, 'deleteFavorite');
    const handleCancellationSpy = spyOn(component, 'handleCancellation');
    const confirmed = true;
    const itemToDelete = {
      itemId: 105,
      titulo: 'Another Item to Delete',
    } as Item;

    component.itemToDelete = itemToDelete;

    const testUserId = 123;

    component.userId = testUserId;

    expect(deleteFavoriteSpy).not.toHaveBeenCalled();
    expect(handleCancellationSpy).not.toHaveBeenCalled();

    component.handleConfirmation(confirmed);

    expect(deleteFavoriteSpy).toHaveBeenCalled();
    expect(deleteFavoriteSpy).toHaveBeenCalledTimes(1);
    expect(deleteFavoriteSpy).toHaveBeenCalledWith(component.userId!, component.itemToDelete.itemId);
    expect(handleCancellationSpy).not.toHaveBeenCalled();

  });

  it('deleteFavorite should set isDeleting and call apiService.removeFavorite', fakeAsync(() => {

    const testUserId = 123;
    const testItemId = 500;

    expect(component.isDeleting).toBeFalse();
    expect(component.error).toBe('');
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();
    component.deleteFavorite(testUserId, testItemId);

    expect(component.error).toBe('');
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledWith( testUserId, testItemId );
    expect(apiServiceSpy.getUserFavorites).not.toHaveBeenCalled();

  }));

  it('deleteFavorite should filter favoriteItems list on removeFavorite success response', fakeAsync(() => {

    const testUserId = 123;
    const itemIdToDelete = 2;
    const initialFavoriteItems: Item[] = [
      { itemId: 1, titulo: 'Fav Item 1', esFavorito: true } as Item,
      {
        itemId: itemIdToDelete,
        titulo: 'Fav Item to Delete',
        esFavorito: true,
      } as Item,
      { itemId: 3, titulo: 'Fav Item 3', esFavorito: true } as Item,
    ];

    component.favoriteItems = [...initialFavoriteItems];

    expect(component.favoriteItems.length).toBe(3);
    expect(component.error).toBe('');

    apiServiceSpy.removeFavorite.and.returnValue(of({}));

    component.deleteFavorite(testUserId, itemIdToDelete);

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledOnceWith(
      testUserId,
      itemIdToDelete
    );

    tick();

    expect(component.favoriteItems.length).toBe(2);
    expect(component.favoriteItems.map((item) => item.itemId)).toEqual([1, 3]);
    expect(
      component.favoriteItems.find((item) => item.itemId === itemIdToDelete)
    ).toBeUndefined();
    expect(component.error).toBe('');

  }));

  it('deleteFavorite should set error on removeFavorite error response', fakeAsync(() => {

    const testUserId = 123;
    const testItemId = 500;
    const initialFavoriteItems: Item[] = [
      { itemId: 1, titulo: 'Fav Item 1', esFavorito: true } as Item,
      { itemId: 2, titulo: 'Fav Item 2', esFavorito: true } as Item,
    ];

    component.favoriteItems = [...initialFavoriteItems];

    expect(component.favoriteItems.length).toBe(2);

    const apiError = {
      error: { message: 'Original API Error Message' },
      status: 500,
    };

    apiServiceSpy.removeFavorite.and.returnValue(throwError(() => apiError));

    component.error = '';
    component.deleteFavorite(testUserId, testItemId);

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledOnceWith(
      testUserId,
      testItemId
    );

    tick();

    expect(component.error).toBe('Error al eliminar el ítem de favoritos.');
    expect(component.favoriteItems).toEqual(initialFavoriteItems);

  }));

});
