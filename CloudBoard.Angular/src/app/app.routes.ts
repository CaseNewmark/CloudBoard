import { Routes } from '@angular/router';
import { FlowboardComponent } from './flowboard/flowboard.component'; // Adjust the path as needed
import { ProjectsComponent } from './projects/projects.component';
import { TimelineComponent } from './timeline/timeline.component';

export const routes: Routes = [
  { path: 'flowboard', component: FlowboardComponent },
  { path: 'flowboard/:id', component: FlowboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: '', redirectTo: 'flowboard', pathMatch: 'full' }
];
