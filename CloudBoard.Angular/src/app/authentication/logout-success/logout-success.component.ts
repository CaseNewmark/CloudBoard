import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-logout-success',
  imports: [CommonModule],
  templateUrl: './logout-success.component.html',
  styleUrl: './logout-success.component.css'
})
export class LogoutSuccessComponent {
  private router = inject(Router);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Logout Successful',
      detail: 'You have been successfully logged out',
      life: 3000
    });

    // Redirect to home after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000);
  }
}
