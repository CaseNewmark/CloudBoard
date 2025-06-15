import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'auth-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router, // Make it public for template access
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const code = this.route.snapshot.queryParams['code'];
      const error = this.route.snapshot.queryParams['error'];

      console.log('Auth callback - Code:', code ? 'Present' : 'Missing');
      console.log('Auth callback - Error:', error);

      if (error) {
        throw new Error(`Authentication error: ${error}`);
      }

      if (code) {
        console.log('Processing authentication callback...');
        await this.authService.handleCallback(code);
        
        // Check if authentication was successful
        if (this.authService.isLoggedIn()) {
          console.log('Authentication successful, redirecting to flowboards...');
          await this.router.navigate(['/flowboard']);
        } else {
          throw new Error('Authentication failed - user not logged in after callback');
        }
      } else {
        throw new Error('No authorization code received');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      this.error = true;
      this.loading = false;
      
      // Redirect to home after a few seconds if there's an error
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 3000);
    }
  }
}
