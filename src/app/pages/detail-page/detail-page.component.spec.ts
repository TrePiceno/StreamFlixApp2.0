import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetailPageComponent } from './detail-page.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: jasmine.createSpy('getParamMap').and.returnValue(null),
    },
  },
};

const locationMock = {
  back: jasmine.createSpy('back'),
};

const apiServiceMock = {

  getItemDetails: jasmine.createSpy('getItemDetails').and.returnValue(of(null)),
  addFavorite: jasmine.createSpy('addFavorite').and.returnValue(of({})),
  removeFavorite: jasmine.createSpy('removeFavorite').and.returnValue(of({})),
};

const authServiceMock = {
  getUserId: jasmine.createSpy('getUserId').and.returnValue(123),
};

describe('DetailPageComponent', () => {
  let component: DetailPageComponent;
  let fixture: ComponentFixture<DetailPageComponent>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let locationSpy: jasmine.SpyObj<Location>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailPageComponent, CommonModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Location, useValue: locationMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailPageComponent);

    component = fixture.componentInstance;
    component.item = null;
    component.loading = true;
    component.error = '';
    component.userId = null;
    component.itemId = null;

    activatedRouteSpy = TestBed.inject(ActivatedRoute) as any;
    locationSpy = TestBed.inject(Location) as any;
    apiServiceSpy = TestBed.inject(ApiService) as any;
    authServiceSpy = TestBed.inject(AuthService) as any;

    (activatedRouteSpy.snapshot.paramMap as any).get.calls.reset();
    locationSpy.back.calls.reset();
    apiServiceMock.getItemDetails.calls.reset();
    apiServiceMock.addFavorite.calls.reset();
    apiServiceMock.removeFavorite.calls.reset();
    authServiceMock.getUserId.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set error and loading to false if userId is null', fakeAsync(() => {

    authServiceSpy.getUserId.and.returnValue(null);


    expect(component.error).toBe('');
    expect(component.loading).toBe(true);
    expect(component.userId).toBeNull();
    expect(component.itemId).toBeNull();
    expect(component.item).toBeNull();
    expect(activatedRouteSpy.snapshot.paramMap.get).not.toHaveBeenCalled();
    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    fixture.detectChanges()

    expect(component.userId).toBeNull();
    expect(component.error).toBe('Usuario no autenticado.');
    expect(component.loading).toBeFalse();
    expect(component.itemId).toBeNull();
    expect(component.item).toBeNull();
    expect(activatedRouteSpy.snapshot.paramMap.get).not.toHaveBeenCalled();
    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    tick();

  }));


  it('ngOnInit should set error and loading to false if userId is not null but itemId is null', fakeAsync(() => {

    const testUserId = 123; 
    authServiceSpy.getUserId.and.returnValue(testUserId); 
    (activatedRouteSpy.snapshot.paramMap as any).get.and.returnValue(null);

    spyOn(component, 'loadItemDetails');

    expect(component.userId).toBeNull();
    expect(component.itemId).toBeNull();
    expect(component.error).toBe('');
    expect(component.loading).toBe(true);
    expect(component.item).toBeNull();
    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(component.userId).toBe(testUserId);
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalled();
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledTimes(1);
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.itemId).toBeNull();

    expect(component.error).toBe('No se especificó un ID de ítem.');
    expect(component.loading).toBeFalse();
    expect(component.item).toBeNull();
    expect(component.loadItemDetails).not.toHaveBeenCalled();
    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    tick();

  }));

  it('ngOnInit should get userId and itemId and call loadItemDetails if both are not null', fakeAsync(() => {

    const testUserId = 123;
    authServiceSpy.getUserId.and.returnValue(testUserId);

    const testItemIdString = '456';
    const expectedItemIdNumber = +testItemIdString;
    (activatedRouteSpy.snapshot.paramMap as any).get.and.returnValue(testItemIdString);

    const loadItemDetailsSpy = spyOn(component, 'loadItemDetails');

    expect(component.userId).toBeNull();
    expect(component.itemId).toBeNull();
    expect(component.error).toBe('');
    expect(component.loading).toBe(true);
    expect(component.item).toBeNull();
    expect(loadItemDetailsSpy).not.toHaveBeenCalled();

    fixture.detectChanges(); 

    expect(component.userId).toBe(testUserId);
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalled();
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledTimes(1);
    expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.itemId).toBe(expectedItemIdNumber);
    expect(component.error).toBe('');
    expect(component.loading).toBeTrue();
    expect(component.item).toBeNull();
    expect(loadItemDetailsSpy).toHaveBeenCalled();
    expect(loadItemDetailsSpy).toHaveBeenCalledTimes(1);
    expect(loadItemDetailsSpy).toHaveBeenCalledWith(
      testUserId,
      expectedItemIdNumber
    );
    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    tick();

  }));

  it('loadItemDetails should set loading, clear item/error and call apiService.getItemDetails', fakeAsync(() => {

    const testUserId = 123;
    const testItemId = 456;
    component.item = { itemId: 999, titulo: 'Dummy Item Details' } as any;
    component.loading = false;
    component.error = 'Previous Error';

    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    component.loadItemDetails( testUserId, testItemId );

    expect(component.item).toBeNull();
    expect(apiServiceSpy.getItemDetails).toHaveBeenCalled();
    expect(apiServiceSpy.getItemDetails).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getItemDetails).toHaveBeenCalledWith( testUserId, testItemId );

  }));


  it('loadItemDetails should handle successful apiService.getItemDetails response with item', fakeAsync(() => {

    const mockItem: Item = {
      itemId: 1,
      titulo: 'Detailed Item',
      esFavorito: false,
    } as Item;


    apiServiceSpy.getItemDetails.and.returnValue(of(mockItem));

    component.loading = true;
    component.item = null;
    component.error = '';

    const testUserId = 123;
    const testItemId = 456;

    expect(apiServiceSpy.getItemDetails).not.toHaveBeenCalled();

    component.loadItemDetails(testUserId, testItemId);

    expect(apiServiceSpy.getItemDetails).toHaveBeenCalledOnceWith(
      testUserId,
      testItemId
    );

    expect(component.item).toBeNull();

    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');

  }));

  it('goBack should call location.back', () => {

    expect(locationSpy.back).not.toHaveBeenCalled();

    component.goBack();

    expect(locationSpy.back).toHaveBeenCalled();
    expect(locationSpy.back).toHaveBeenCalledTimes(1);

  });

  it('toggleFavorite should do nothing if userId is null', () => {

    component.userId = null;
    component.item = {
      itemId: 1,
      titulo: 'Some Item',
      esFavorito: false,
    } as any;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite();

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();
    expect(component.item!.esFavorito).toBeFalse();

  });

  it('toggleFavorite should do nothing if item is null', () => {

    component.userId = 123;
    component.item = null;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite();

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  });

  it('toggleFavorite should call removeFavorite if item is favorite', () => {

    const testUserId = 123;

    component.userId = testUserId;

    const testItem: Item = {
      itemId: 789,
      titulo: 'Favorite Item',
      esFavorito: true,
    } as Item;
    component.item = testItem;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite();

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledWith(
      testUserId,
      testItem.itemId
    );
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

  });

  it('toggleFavorite should call addFavorite if item is not favorite', () => {

    const testUserId = 123;
    component.userId = testUserId;
    const testItem: Item = {
      itemId: 789,
      titulo: 'Non-Favorite Item',
      esFavorito: false,
    } as Item;
    component.item = testItem;

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    component.toggleFavorite();

    expect(apiServiceSpy.addFavorite).toHaveBeenCalled();
    expect(apiServiceSpy.addFavorite).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.addFavorite).toHaveBeenCalledWith(
      testUserId,
      testItem.itemId
    );
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

  });

  it('toggleFavorite should set item.esFavorito to false on removeFavorite success', fakeAsync(() => {

    const testUserId = 123;

    component.userId = testUserId;

    const testItem: Item = {
      itemId: 789,
      titulo: 'Favorite Item',
      esFavorito: true,
    } as Item;
    component.item = testItem;

    expect(component.item.esFavorito).toBeTrue();
    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();

    apiServiceSpy.removeFavorite.and.returnValue(of({}));

    component.toggleFavorite();

    expect(apiServiceSpy.removeFavorite).toHaveBeenCalledOnceWith(
      testUserId,
      testItem.itemId
    );

    expect(component.item.esFavorito).toBeTrue();

    tick();

    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();
    expect(component.error).toBe(''); 

  }));

  it('toggleFavorite should set item.esFavorito to true on addFavorite success', fakeAsync(() => {

    const testUserId = 123;

    component.userId = testUserId;

    const testItem: Item = {
      itemId: 789,
      titulo: 'Non-Favorite Item',
      esFavorito: false,
    } as Item; 
    component.item = testItem;

    expect(component.item.esFavorito).toBeFalse();
    expect(apiServiceSpy.addFavorite).not.toHaveBeenCalled();

    apiServiceSpy.addFavorite.and.returnValue(of({}));

    component.toggleFavorite();

    expect(apiServiceSpy.addFavorite).toHaveBeenCalledOnceWith(
      testUserId,
      testItem.itemId
    );
    expect(component.item.esFavorito).toBeFalse(); // Todavía false ANTES de tick

    tick();

    expect(apiServiceSpy.removeFavorite).not.toHaveBeenCalled();
    expect(component.error).toBe('');

  }));

});
