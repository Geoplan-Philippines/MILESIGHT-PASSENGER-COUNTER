import { Component, signal, effect } from '@angular/core';
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
  logs = signal<LogEntry[]>([]);
  currentUser = signal<any>(null);
  statistics = signal({
    totalPassengers: 0,
    totalEntries: 0,
    uniquePlates: 0
  });
  searchQuery = signal('');
  filterBy = signal<'all' | 'date' | 'guard'>('all');

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    // Load current user
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user());

    // Load logs
    this.loadLogs();

    // Auto-refresh logs
    effect(() => {
      this.loadLogs();
    });
  }

  loadLogs(): void {
    this.logs.set(this.storageService.getLogs());
    this.statistics.set(this.storageService.getStatistics());
  }

  getFilteredLogs(): LogEntry[] {
    const logs = this.logs();
    const query = this.searchQuery().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter(log =>
      log.plateNumber.toLowerCase().includes(query) ||
      log.guardName.toLowerCase().includes(query) ||
      log.date.includes(query)
    );
  }

  deleteLog(id: string): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.storageService.deleteLog(id);
      this.loadLogs();
    }
  }

  clearAllLogs(): void {
    if (confirm('Are you sure you want to delete ALL logs? This action cannot be undone.')) {
      this.storageService.clearAllLogs();
      this.loadLogs();
    }
  }

  exportLogs(): void {
    const logs = this.logs();
    const csv = this.convertToCSV(logs);
    this.downloadCSV(csv, 'passenger-logs.csv');
  }

  private convertToCSV(logs: LogEntry[]): string {
    const headers = ['Date', 'Time', 'Guard Name', 'Plate Number', 'Passenger Count'];
    const rows = logs.map(log => [
      log.date,
      log.time,
      log.guardName,
      log.plateNumber,
      log.count.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
