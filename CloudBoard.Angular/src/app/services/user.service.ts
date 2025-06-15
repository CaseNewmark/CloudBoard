import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_KEY = 'user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setUser(userInfo: any): void {
    const user: User = {
      id: userInfo.sub,
      username: userInfo.preferred_username,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      roles: userInfo.realm_access?.roles || []
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }
}