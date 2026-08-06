import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);

  // Reactive state for user profile dropdown
  readonly profileMenuOpen = signal(false);

  ngOnInit(): void {
    this.userService.loadProfile();
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
    this.userService.clearProfile();
    this.router.navigate(['/auth/login']);
  }
}
