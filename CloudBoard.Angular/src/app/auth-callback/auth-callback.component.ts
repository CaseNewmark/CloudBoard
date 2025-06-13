import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const code = this.route.snapshot.queryParams['code'];
      const error = this.route.snapshot.queryParams['error'];

      if (error) {
        throw new Error(`Authentication error: ${error}`);
      }

      if (code) {
        await this.authService.handleCallback(code);
        this.router.navigate(['/projects']);
      } else {
        throw new Error('No authorization code received');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      this.error = true;
      this.loading = false;
    }
  }
}
