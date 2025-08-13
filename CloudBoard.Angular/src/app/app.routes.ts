import { Routes } from '@angular/router';
import { CloudboardComponent } from './cloudboard/cloudboard.component'; // Adjust the path as needed
import { ProjectsComponent } from './projects/projects.component';
import { TimelineComponent } from './timeline/timeline.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthCallbackComponent } from './authentication/auth-callback/auth-callback.component';
import { AuthGuard } from './authentication/guards/auth.guard';
import { LogoutSuccessComponent } from './authentication/logout-success/logout-success.component';
import { SortingApplicationManagerComponent } from './sorting/components/sorting-application-manager.component'; 

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'cloudboard', component: CloudboardComponent, canActivate: [AuthGuard] },
  { path: 'cloudboard/:id', component: CloudboardComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'timeline', component: TimelineComponent, canActivate: [AuthGuard] },
  { path: 'sorting-applications', component: SortingApplicationManagerComponent, canActivate: [AuthGuard] },
  { path: 'logout-success', component: LogoutSuccessComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
