import { Injectable } from '@angular/core';

interface PassengerData {
  count: number;
  plateNumber: string;
  lastUpdated: string;
}

export interface LogEntry {
  id: string;
  count: number;
  plateNumber: string;
  guardName: string;
  guardId: string;
  direction?: 'IN' | 'OUT';
  timestamp: string;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'passengerData';
  private readonly LOGS_KEY = 'passengerLogs';

  getPassengerData(): PassengerData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultData();
      }
    }
    return this.getDefaultData();
  }

  savePassengerData(count: number, plateNumber: string): void {
    const data: PassengerData = {
      count,
      plateNumber,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Logs management
  getLogs(): LogEntry[] {
    const stored = localStorage.getItem(this.LOGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }

  addLog(count: number, plateNumber: string, guardName: string, guardId: string, direction?: 'IN' | 'OUT'): LogEntry {
    const now = new Date();
    const logEntry: LogEntry = {
      id: this.generateId(),
      count,
      plateNumber,
      guardName,
      guardId,
      direction,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const logs = this.getLogs();
    logs.unshift(logEntry); // Add to beginning for newest first
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
    return logEntry;
  }

  deleteLog(id: string): void {
    const logs = this.getLogs();
    const filteredLogs = logs.filter(log => log.id !== id);
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(filteredLogs));
  }

  clearAllLogs(): void {
    localStorage.removeItem(this.LOGS_KEY);
  }

  getLogsByGuard(guardId: string): LogEntry[] {
    return this.getLogs().filter(log => log.guardId === guardId);
  }

  getStatistics() {
    const logs = this.getLogs();
    const totalPassengers = logs.reduce((sum, log) => sum + log.count, 0);
    const totalEntries = logs.length;
    const uniquePlates = new Set(logs.map(log => log.plateNumber)).size;

    return {
      totalPassengers,
      totalEntries,
      uniquePlates
    };
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultData(): PassengerData {
    return {
      count: 0,
      plateNumber: '',
      lastUpdated: new Date().toISOString()
    };
  }
}
