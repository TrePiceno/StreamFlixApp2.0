import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { catchError, of, finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css',
})
export class FavoritesPageComponent implements OnInit {

  favoriteItems: Item[] = [];
  loading = true;
  error = '';
  userId: number | null = null;
  showConfirmModal = false;
  itemToDelete: Item | null = null;
  isDeleting = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (this.userId === null) {
      this.error = 'Usuario no autenticado.';
      this.loading = false;
      console.error('Favorites page loaded without authenticated user.');
      return;
    }

    this.loadFavorites(this.userId);
  }

  loadFavorites(userId: number): void {
    this.loading = true;
    this.error = '';
    this.favoriteItems = [];

    this.apiService
      .getUserFavorites(userId)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error = 'Error al cargar los favoritos. Inténtalo de nuevo.';
          console.error('Error fetching favorites:', err);
          return of([]);
        })
      )
      .subscribe((items: Item[]) => {
        this.loading = false;
        this.favoriteItems = items;
      });
  }

  confirmRemoveFavorite(item: Item): void {
    if (this.isDeleting) {
      console.warn(
        'Ya se está realizando una eliminación. Espera a que termine.'
      );
      return;
    }

    this.itemToDelete = item;
    this.showConfirmModal = true;
  }

  handleConfirmation(confirmed: boolean): void {
    if (confirmed && this.itemToDelete && this.userId !== null) {
      this.deleteFavorite(this.userId, this.itemToDelete.itemId);
    } else {
      this.handleCancellation();
    }
  }

  handleCancellation(): void {
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }

  deleteFavorite(userId: number, itemId: number): void {
    this.isDeleting = true;
    this.error = '';

    this.apiService
      .removeFavorite(userId, itemId)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
          this.showConfirmModal = false;
          this.itemToDelete = null;
        }),
        catchError((err) => {
          console.error('Error al eliminar favorito:', err);
          this.error = 'Error al eliminar el ítem de favoritos.';
          return of(null);
        })
      )
      .subscribe(
        (response) => {
          this.favoriteItems = this.favoriteItems.filter(
            (item) => item.itemId !== itemId
          );
          console.log(`Ítem ${itemId} eliminado de la lista local.`);
        }
      );
  }

}
