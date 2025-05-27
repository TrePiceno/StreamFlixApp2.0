import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnDestroy {

  userName: string | null = null;
  private userSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.userName = user ? user.username : null;
    });
  }

  ngOnDestroy(): void {

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

  }

  logout(): void {

    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
}
