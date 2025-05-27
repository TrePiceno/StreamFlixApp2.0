import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { catchError, debounceTime, distinctUntilChanged, of, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css',
})
export class CatalogPageComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  items: Item[] = [];
  loading = true;
  error = '';
  userId: number | null = null;
  categories = ['', 'pelicula', 'serie'];
  genres = [
    '',
    'Comedia',
    'Acción',
    'Ciencia Ficción',
    'Drama',
    'Thriller',
    'Drama histórico',
  ];

  private filterChangesSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      genre: [''],
    });
  }

  ngOnInit(): void {

    this.userId = this.authService.getUserId();
    this.loadCatalog();
    this.filterChangesSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((filters) => {
        this.loadCatalog(filters.category, filters.genre);
      });
  }

  ngOnDestroy(): void {
    if (this.filterChangesSubscription) {
      this.filterChangesSubscription.unsubscribe();
    }
  }

  loadCatalog(category?: string, genre?: string): void {
    this.loading = true;
    this.error = '';
    this.items = [];
    this.apiService
      .getCatalog(this.userId, category, genre)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error = 'Error al cargar el catálogo';
          console.error('Error fetching catalog:', err);
          return of([]);
        })
      )
      .subscribe((items: Item[]) => {
        this.loading = false;
        this.items = items;
      });
  }

  resetFilters(): void {
    this.filterForm.reset({ category: '', genre: '' });
  }

  toggleFavorite(item: Item): void {

    if (this.userId === null) {
      console.error(
        'Usuario no logeado. No se puede marcar/desmarcar favorito.'
      );
      return;
    }

    try {
      this.error = ''; 

      if (item.esFavorito) {
        this.apiService
          .removeFavorite(this.userId, item.itemId)
          .pipe(
            catchError((err) => {
              console.error('Error removing favorite from catalog:', err);
              this.error = 'Error al eliminar el favorito.';
              return of(null);
            })
          )
          .subscribe((response) => {
            if (response) {
              item.esFavorito = false;
              console.log(
                `Item ${item.itemId} eliminado de favoritos (catálogo).`
              );
            }
          });
      } else {
        this.apiService
          .addFavorite(this.userId, item.itemId)
          .pipe(
            catchError((err) => {
              console.error('Error adding favorite from catalog:', err);
              this.error = 'Error al añadir el favorito.'; 
              return of(null);
            })
          )
          .subscribe((response) => {
            if (response) {
              item.esFavorito = true;
            }
          });
      }
    } catch (e) {
      console.error('Unexpected error in toggleFavorite:', e);
      this.error = 'Error inesperado. Inténtalo de nuevo.'; 
    }
  }
}