import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model'; 
import { catchError, of } from 'rxjs'; 

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-page.component.html',
  styleUrl: './detail-page.component.css',
})
export class DetailPageComponent implements OnInit {
  item: Item | null = null;
  loading = true;
  error = '';
  userId: number | null = null;
  itemId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private location: Location
  )
  {}

  ngOnInit(): void {

    this.userId = this.authService.getUserId();

    if (this.userId === null) {
      this.error = 'Usuario no autenticado.';
      this.loading = false;
      console.error('Detail page loaded without authenticated user.');
      return;
    };

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.itemId = +idParam;
      this.loadItemDetails(this.userId, this.itemId);
    } else {
      this.error = 'No se especificó un ID de ítem.';
      this.loading = false;
      console.error('Item ID not provided in route.');
    }
  }


  loadItemDetails(userId: number, itemId: number): void {
    this.loading = true;
    this.error = '';
    this.item = null; 

    this.apiService
      .getItemDetails(userId, itemId)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error =
            'Error al cargar los detalles del ítem. Inténtalo de nuevo.';
          console.error('Error fetching item details:', err);
          return of(null);
        })
      )
      .subscribe((item: Item | null) => {
        this.loading = false;
        if (item) {
          this.item = item;
        } else {
          this.error = 'No se encontró el ítem.';
          console.warn(`Item with ID ${itemId} not found.`);
        }
      });
  }

  toggleFavorite(): void {
    if (this.userId === null || !this.item) {
      console.error(
        'No se puede alternar favorito: usuario no logeado o ítem no cargado.'
      );
      return;
    }

    if (this.item.esFavorito) {
      this.apiService
        .removeFavorite(this.userId, this.item.itemId)
        .pipe(
          catchError((err) => {
            console.error('Error eliminando favorito desde detalle:', err);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response) {
            this.item!.esFavorito = false; 
          }
        });
    } else {
      this.apiService
        .addFavorite(this.userId, this.item.itemId)
        .pipe(
          catchError((err) => {
            console.error('Error añadiendo favorito desde detalle:', err);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response) {
            this.item!.esFavorito = true; 
          }
        });
    }
  }

  goBack(): void {
    this.location.back(); 
  }

}
