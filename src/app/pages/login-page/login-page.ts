import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  username = signal('');
  selectedRole = signal<'ADMIN' | 'GUARD'>('GUARD');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (!this.username().trim()) {
        this.errorMessage.set('Please enter a username');
        this.isLoading.set(false);
        return;
      }

      const success = this.authService.login(this.username(), this.selectedRole());

      if (success) {
        // Redirect based on role
        if (this.selectedRole() === 'GUARD') {
          this.router.navigate(['/counter']);
        } else {
          this.router.navigate(['/logs']);
        }
      } else {
        this.errorMessage.set('Invalid username or role. Try "admin" or "guard"');
      }

      this.isLoading.set(false);
    }, 300);
  }

  toggleRole(): void {
    this.selectedRole.update(role => role === 'ADMIN' ? 'GUARD' : 'ADMIN');
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}
