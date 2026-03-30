import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'GUARD' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private readonly STORAGE_KEY = 'currentUser';

  // Mock users for demo
  private mockUsers: Record<string, User> = {
    'admin': {
      id: '1',
      name: 'Admin User',
      role: 'ADMIN'
    },
    'guard': {
      id: '2',
      name: 'Guard User',
      role: 'GUARD'
    }
  };

  constructor() {
    this.loadUserFromStorage();
  }

  login(username: string, role: UserRole): boolean {
    const user = this.mockUsers[username.toLowerCase()];
    
    if (user && user.role === role) {
      this.currentUser.set(user);
      this.saveUserToStorage(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserRole(): UserRole {
    return this.currentUser()?.role || null;
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }
}
