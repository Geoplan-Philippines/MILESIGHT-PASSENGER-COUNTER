import { Component, effect, signal, computed, OnInit, OnDestroy } from '@angular/core';
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
export class CounterPage implements OnInit, OnDestroy {

  // ── Signals ───────────────────────────────────────────────────────────────
  count          = signal<number>(0);
  plateNumber    = signal<string>('');
  currentUser    = signal<any>(null);
  direction      = signal<'IN' | 'OUT' | null>(null);
  toastMessage   = signal<string>('');
  toastType      = signal<'success' | 'error'>('success');
  toastVisible   = signal<boolean>(false);           // ← single declaration
  entries        = signal<any[]>([]);

  // ── Derived ───────────────────────────────────────────────────────────────
  recentEntries  = computed(() => this.entries().slice(0, 6));
  canDecrement   = computed(() => this.count() > 0);

  // ── Local UI state ────────────────────────────────────────────────────────
  editingCount     = false;
  manualCountValue = 0;
  countAnimClass   = '';

  // ── Clock ─────────────────────────────────────────────────────────────────
  currentTime = signal<string>('');
  currentDate = signal<string>('');
  private clockInterval: any;

  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('en-PH', { hour12: false }));
    this.currentDate.set(now.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user());

    const savedData = this.storageService.getPassengerData();
    this.count.set(savedData.count);
    this.plateNumber.set(savedData.plateNumber);

    effect(() => {
      this.storageService.savePassengerData(this.count(), this.plateNumber());
    });
  }

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
  }

  // ── Counter ───────────────────────────────────────────────────────────────
  enableEditCount(): void {
    this.manualCountValue = this.count();
    this.editingCount = true;
    setTimeout(() => {
      const input = document.getElementById('manualInput') as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 50);
  }

  saveManualCount(): void {
    const val = Math.max(0, Math.floor(Number(this.manualCountValue)) || 0);
    this.count.set(val);
    this.editingCount = false;
  }

  increment(): void {
    this.count.update(c => c + 1);
    this.triggerAnim('bump-up');
  }

  decrement(): void {
    if (this.count() === 0) return;
    this.count.update(c => c - 1);
    this.triggerAnim('bump-down');
  }

  reset(): void {
    this.count.set(0);
    this.plateNumber.set('');
    this.countAnimClass = '';
  }

  triggerAnim(cls: string): void {
    this.countAnimClass = '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { this.countAnimClass = cls; });
    });
    setTimeout(() => { this.countAnimClass = ''; }, 300);
  }

  // ── Direction ─────────────────────────────────────────────────────────────
  setDirection(dir: 'IN' | 'OUT'): void {
    this.direction.set(dir);
  }

  // ── Plate ─────────────────────────────────────────────────────────────────
  onPlateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.plateNumber.set(input.value);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  private toastTimer: any;

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (!this.plateNumber().trim()) {
      this.showToast('Please enter a plate number', 'error');
      return;
    }
    if (!this.direction()) {
      this.showToast('Please select IN or OUT', 'error');
      return;
    }

    const user = this.currentUser();
    const directionValue = this.direction();

    this.storageService.addLog(
      this.count(),
      this.plateNumber(),
      user?.name || 'Unknown',
      user?.id   || 'unknown',
      directionValue === null ? undefined : directionValue
    );

    // Add to local recent entries list
    this.entries.update(prev => [{
      id:        Date.now(),
      count:     this.count(),
      direction: directionValue,
      plate:     this.plateNumber(),
      time:      new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }, ...prev]);

    this.showToast(
      `Entry submitted — ${directionValue} · ${this.count()} pax · ${this.plateNumber()}`,
      'success'
    );

    // Reset for next entry
    this.count.set(0);
    this.plateNumber.set('');
    this.direction.set(null);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}