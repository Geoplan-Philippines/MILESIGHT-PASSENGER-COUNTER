import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-counter-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './counter-page.html',
  styleUrl: './counter-page.css',
})
export class CounterPage {
  count = signal<number>(0);
  plateNumber = signal<string>('');
  currentUser = signal<any>(null);
  submitMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    // Load current user
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user());

    // Load saved data from localStorage
    const savedData = this.storageService.getPassengerData();
    this.count.set(savedData.count);
    this.plateNumber.set(savedData.plateNumber);

    // Auto-save to localStorage whenever count or plateNumber changes
    effect(() => {
      this.storageService.savePassengerData(this.count(), this.plateNumber());
    });
  }

  increment(): void {
    this.count.update(c => c + 1);
  }

  decrement(): void {
    this.count.update(c => c > 0 ? c - 1 : 0);
  }

  reset(): void {
    this.count.set(0);
    this.plateNumber.set('');
  }

  submit(): void {
    this.submitMessage.set('');
    
    if (!this.plateNumber().trim()) {
      this.submitMessage.set('⚠️ Please enter a plate number');
      setTimeout(() => this.submitMessage.set(''), 3000);
      return;
    }

    // Save to logs with user info
    const user = this.currentUser();
    this.storageService.addLog(
      this.count(),
      this.plateNumber(),
      user?.name || 'Unknown',
      user?.id || 'unknown'
    );

    // Show success message
    this.submitMessage.set(`✓ Entry submitted - ${this.count()} passengers, Plate: ${this.plateNumber()}`);
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      this.submitMessage.set('');
    }, 3000);

    // Reset for next entry
    setTimeout(() => {
      this.count.set(0);
      this.plateNumber.set('');
    }, 2000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
