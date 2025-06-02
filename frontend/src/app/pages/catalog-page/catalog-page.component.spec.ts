import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CatalogPageComponent } from './catalog-page.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Item } from '../../models/item.model';

const apiServiceMock = {
  getCatalog: jasmine.createSpy('getCatalog').and.returnValue(of([])),
  addFavorite: jasmine.createSpy('addFavorite').and.returnValue(of({})),
  removeFavorite: jasmine.createSpy('removeFavorite').and.returnValue(of({})),
};

const authServiceMock = {
  getUserId: jasmine.createSpy('getUserId').and.returnValue(123),
};

describe('CatalogPageComponent', () => {
  let component: CatalogPageComponent;
  let fixture: ComponentFixture<CatalogPageComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let formBuilderSpy: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPageComponent);
    component = fixture.componentInstance;

    component.items = [];
    component.loading = false;
    component.error = '';
    component.userId = null;

    apiServiceSpy = TestBed.inject(ApiService) as any;
    authServiceSpy = TestBed.inject(AuthService) as any;
    formBuilderSpy = TestBed.inject(FormBuilder);

    fixture.detectChanges();

    apiServiceMock.getCatalog.calls.reset();
    apiServiceMock.addFavorite.calls.reset();
    apiServiceMock.removeFavorite.calls.reset();
    authServiceSpy.getUserId.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should get userId from AuthService', () => {

    expect(component.userId).toBe(123);

  });

  it('ngOnInit should call apiService.getCatalog initially with no filters', fakeAsync(() => {

    expect(apiServiceSpy.getCatalog).not.toHaveBeenCalled();
    expect(apiServiceSpy.getCatalog).toHaveBeenCalledTimes(0);

    tick();

  }));

  it('loadCatalog should set loading, clear items/error and call apiService.getCatalog', fakeAsync(() => {

    apiServiceSpy.getCatalog.and.returnValue(of([]));

    expect(apiServiceSpy.getCatalog).not.toHaveBeenCalled();

    component.items = [
      { itemId: 99, titulo: 'Dummy Item', esFavorito: false } as any,
    ];
    component.loading = false;
    component.error = 'Previous Error';

    const testCategory = 'pelicula';
    const testGenre = 'Comedia';

    expect(component.userId).toBe(123);

    component.loadCatalog(testCategory, testGenre);

    expect(component.items.length).toBe(0);
    expect(component.error).toBe('');
    expect(apiServiceSpy.getCatalog).toHaveBeenCalled(); 
    expect(apiServiceSpy.getCatalog).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getCatalog).toHaveBeenCalledWith( authServiceSpy.getUserId(), testCategory,testGenre );

    tick();

  }));

  it('loadCatalog should handle successful apiService.getCatalog response', fakeAsync(() => {

    const mockItems: Item[] = [
      { itemId: 1, titulo: 'Item 1', esFavorito: false } as any,
      { itemId: 2, titulo: 'Item 2', esFavorito: true } as any,
    ];

    apiServiceSpy.getCatalog.and.returnValue(of(mockItems));

    component.loading = true;
    component.items = [];
    component.error = '';

    component.loadCatalog();

    expect(apiServiceSpy.getCatalog).toHaveBeenCalled();

    tick();

    expect(component.loading).toBeFalse();
    expect(component.items).toEqual(mockItems);
    expect(component.error).toBe('');

  }));

  it('loadCatalog should handle apiService.getCatalog error response', fakeAsync(() => {

    const apiError = {
      error: { message: 'Original API Error Message' },
      status: 500,
    }; 

    apiServiceSpy.getCatalog.and.returnValue(throwError(() => apiError));

    component.loading = true;
    component.items = [];
    component.error = '';
    component.loadCatalog();

    expect(apiServiceSpy.getCatalog).toHaveBeenCalled();

    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe(
      'Error al cargar el catálogo. Inténtalo de nuevo.'
    );
    expect(component.items.length).toBe(0);

  }));

  it('resetFilters should reset the filterForm', () => {

    const testCategory = 'pelicula';
    const testGenre = 'Acción';
    component.filterForm.patchValue({
      category: testCategory,
      genre: testGenre,
    });

    expect(component.filterForm.value).toEqual({
      category: testCategory,
      genre: testGenre,
    });

    component.resetFilters();

    expect(component.filterForm.value).toEqual({ category: '', genre: '' });

  });

  it('resetFilters should trigger loadCatalog with empty filters', fakeAsync(() => {

    const loadCatalogSpy = spyOn(component, 'loadCatalog');

    expect(loadCatalogSpy).not.toHaveBeenCalled();

    component.filterForm.patchValue({ category: 'pelicula', genre: 'Acción' });
    component.resetFilters();

    expect(loadCatalogSpy).not.toHaveBeenCalled();

    tick(300);

    expect(loadCatalogSpy).toHaveBeenCalled();
    expect(loadCatalogSpy).toHaveBeenCalledTimes(1);

    expect(loadCatalogSpy).toHaveBeenCalledWith('', '');

  }));

  it('toggleFavorite should do nothing if userId is null', () => {

    component.userId = null;

    const testItem = { itemId: 1, esFavorito: false } as any;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();
    expect(testItem.esFavorito).toBeFalse();
    expect(component.error).toBe('');

  });

  it('toggleFavorite should call apiService.addFavorite if item is not favorite and userId is not null', () => {

    expect(component.userId).not.toBeNull();

    const testItem = {
      itemId: 1,
      titulo: 'Test Item',
      esFavorito: false,
    } as any;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.addFavorite).toHaveBeenCalled();
    expect(apiServiceSpy.addFavorite).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.addFavorite).toHaveBeenCalledWith(component.userId!,testItem.itemId);
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  });

  it('toggleFavorite should call apiService.removeFavorite if item is favorite and userId is not null', () => {

    expect(component.userId).not.toBeNull();

    const testItem = {
      itemId: 2,
      titulo: 'Another Test Item',
      esFavorito: true,
    } as any;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledWith(
      component.userId!,
      testItem.itemId
    );
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

  });

  it('toggleFavorite should update item.esFavorito to true on addFavorite success', fakeAsync(() => {

    component.userId = 123;

    const testItem = {
      itemId: 1,
      titulo: 'Test Item',
      esFavorito: false,
    } as any;

    apiServiceSpy.addFavorite.and.returnValue(of({}));

    expect(testItem.esFavorito).toBeFalse();
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.addFavorite).toHaveBeenCalled();

    tick();

    expect(testItem.esFavorito).toBeTrue();
    expect(component.error).toBe('');
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  }));

  it('toggleFavorite should update item.esFavorito to true on addFavorite success', fakeAsync(() => {

    component.userId = 123;

    const testItem = {
      itemId: 1,
      titulo: 'Test Item',
      esFavorito: false,
    } as any;

    apiServiceSpy.addFavorite.and.returnValue(of({}));

    expect(testItem.esFavorito).toBeFalse();
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.addFavorite).toHaveBeenCalled();

    tick();

    expect(component.error).toBe('');
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  }));

  it('toggleFavorite should set error on addFavorite error response', fakeAsync(() => {

    component.userId = 123;

    const testItem = {
      itemId: 1,
      titulo: 'Test Item',
      esFavorito: false,
    } as any;

    const apiError = {
      error: { message: 'Original API Error Message' },
      status: 500,
    };

    apiServiceSpy.addFavorite.and.returnValue(throwError(() => apiError));

    component.error = '';
    expect(testItem.esFavorito).toBeFalse();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.addFavorite).toHaveBeenCalled();

    tick(); 

    expect(testItem.esFavorito).toBeFalse();
    expect(component.error).toBe('Error al añadir a favorito.'); 
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  }));

  it('toggleFavorite should set error on removeFavorite error response', fakeAsync(() => {

    component.userId = 123;

    const testItem = {
      itemId: 2,
      titulo: 'Another Test Item',
      esFavorito: true,
    } as any; 

    const apiError = {
      error: { message: 'Original API Error Message' },
      status: 500,
    };

    apiServiceSpy.removeFavorite.and.returnValue(throwError(() => apiError));

    component.error = '';

    expect(testItem.esFavorito).toBeTrue();

    component.toggleFavorite(testItem);

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalled();

    tick();

    expect(testItem.esFavorito).toBeTrue();
    expect(component.error).toBe('Error al eliminar el favorito.');
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

  }));

});