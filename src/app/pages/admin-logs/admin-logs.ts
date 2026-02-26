import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService, LogEntry } from '../../services/storage.service';

@Component({
  selector: 'app-admin-logs',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-logs.html',
  styleUrl: './admin-logs.css'
})
export class AdminLogsPage {

  // ── Signals ───────────────────────────────────────────────────────────────
  logs        = signal<LogEntry[]>([]);
  currentUser = signal<any>(null);
  statistics  = signal({ totalPassengers: 0, totalEntries: 0, uniquePlates: 0 });
  searchQuery = signal('');

  // ── Pagination (plain state — not signals, avoids effect loops) ───────────
  currentPage = 1;
  pageSize    = 10;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.getFilteredLogs().length / this.pageSize));
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  filteredLogs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.logs();
    return this.logs().filter(log =>
      log.plateNumber.toLowerCase().includes(q) ||
      log.guardName.toLowerCase().includes(q) ||
      log.date.includes(q)
    );
  });

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user());
    this.loadLogs();
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  loadLogs(): void {
    this.logs.set(this.storageService.getLogs());
    this.statistics.set(this.storageService.getStatistics());
    // Reset to page 1 when data reloads
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  // Keep template compatibility — delegates to computed signal
  getFilteredLogs(): LogEntry[] {
    return this.filteredLogs();
  }

  paginatedLogs(): LogEntry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const delta = 1;
    const range: number[] = [];
    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) { range.unshift(-1); range.unshift(1); }
    if (range[range.length - 1] < total) { range.push(-1); range.push(total); }
    return range;
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage = 1;
  }

  deleteLog(id: string): void {
    if (confirm('Delete this entry?')) {
      this.storageService.deleteLog(id);
      this.loadLogs();
    }
  }

  clearAllLogs(): void {
    if (confirm('Delete ALL logs? This cannot be undone.')) {
      this.storageService.clearAllLogs();
      this.loadLogs();
    }
  }

  exportLogs(): void {
    const logs = this.logs();
    const headers = ['Date', 'Time', 'Guard Name', 'Plate Number', 'Passenger Count', 'Direction'];
    const rows = logs.map(log => [
      log.date, log.time, log.guardName, log.plateNumber,
      log.count.toString(), log.direction ?? ''
    ]);
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(c => `"${c}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'passenger-logs.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}