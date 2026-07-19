import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../core/services/project.service';
import { ProjectInfo, ProjectAnalysis, ProjectReview } from '../../core/models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterLink, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <div class="header-actions">
        <div>
          <h1>Project Dashboard</h1>
          <p class="subtitle">View and explore static code analyses and AI reviews.</p>
        </div>
        <button mat-flat-button color="primary" routerLink="/upload">
          <mat-icon>cloud_upload</mat-icon> Upload Project
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-icon class="spin">sync</mat-icon>
        <p>Loading projects...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && projects().length === 0">
        <mat-icon class="empty-icon">inventory_2</mat-icon>
        <h3>No projects analyzed yet</h3>
        <p>Upload a Java project ZIP archive to start reviewing code metrics and generating AI recommendations.</p>
        <button mat-flat-button color="primary" routerLink="/upload">
          <mat-icon>cloud_upload</mat-icon> Upload ZIP
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid" *ngIf="!loading && projects().length > 0">
        <mat-card class="project-card" *ngFor="let project of projects()">
          <mat-card-content class="project-content">
            <div class="project-header">
              <div class="project-title-wrapper">
                <mat-icon class="project-icon">folder</mat-icon>
                <div class="project-details">
                  <h3 class="project-name">{{ project.projectName }}</h3>
                  <span class="project-archive">{{ project.archiveName }}</span>
                </div>
              </div>
              <span class="upload-date">{{ project.uploadTimestamp | date:'mediumDate' }}</span>
            </div>

            <div class="project-metrics">
              <div class="metric-item">
                <span class="metric-value">{{ project.javaFiles }}</span>
                <span class="metric-label">Java Files</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ getClassesCount(project.id) }}</span>
                <span class="metric-label">Classes</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ getMethodsCount(project.id) }}</span>
                <span class="metric-label">Methods</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ project.packageCount }}</span>
                <span class="metric-label">Packages</span>
              </div>
            </div>

            <div class="project-status-row">
              <div class="status-indicator">
                <span class="status-label">Analysis:</span>
                <span class="badge" [ngClass]="getAnalysisStatusClass(project.id)">
                  {{ getAnalysisStatus(project.id) }}
                </span>
              </div>
              <div class="status-indicator">
                <span class="status-label">AI Review:</span>
                <span class="badge" [ngClass]="getReviewStatusClass(project.id)">
                  {{ getReviewStatus(project.id) }}
                </span>
              </div>
            </div>

            <div class="project-actions">
              <button mat-stroked-button 
                      *ngIf="getAnalysisId(project.id)"
                      (click)="openProject(getAnalysisId(project.id)!)">
                <mat-icon>analytics</mat-icon> View Analysis
              </button>
              <button mat-flat-button color="primary"
                      *ngIf="!getAnalysisId(project.id)"
                      (click)="triggerAnalysis(project.id)">
                <mat-icon>play_arrow</mat-icon> Run Analysis
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding-top: 10px; }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    .project-card {
      background-color: #ffffff;
      border: 1px solid #d0d7de;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-radius: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
    }
    .project-content {
      padding: 20px;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .project-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .project-icon {
      color: #0969da;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .project-details {
      display: flex;
      flex-direction: column;
    }
    .project-name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #24292f;
    }
    .project-archive {
      font-size: 12px;
      color: #57606a;
    }
    .upload-date {
      font-size: 12px;
      color: #57606a;
    }
    .project-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .metric-item {
      display: flex;
      flex-direction: column;
    }
    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: #24292f;
    }
    .metric-label {
      font-size: 11px;
      color: #57606a;
      margin-top: 2px;
    }
    .project-status-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-label {
      color: #57606a;
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      background-color: #eaeef2;
      color: #57606a;
      
      &.completed, &.ready {
        background-color: #dafbe1;
        color: #1a7f37;
      }
      &.in-progress, &.processing {
        background-color: #ddf4ff;
        color: #0969da;
      }
      &.failed {
        background-color: #ffebe9;
        color: #cf222e;
      }
      &.not-started {
        background-color: #eaeef2;
        color: #57606a;
      }
    }
    .project-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      button {
        width: 100%;
      }
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      color: #57606a;
      .spin {
        animation: spin 1s linear infinite;
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 12px;
      }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 32px;
      border: 1px dashed #d0d7de;
      border-radius: 8px;
      background-color: #ffffff;
      color: #57606a;
      text-align: center;
      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #afb8c1;
        margin-bottom: 16px;
      }
      h3 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #24292f; }
      p { margin: 0 0 24px 0; max-width: 460px; font-size: 14px; }
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  projects = signal<ProjectInfo[]>([]);
  projectAnalyses = signal<Record<string, ProjectAnalysis | null>>({});
  projectReviews = signal<Record<string, ProjectReview | null>>({});
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.projectService.getAllProjects().subscribe({
      next: (projectsList) => {
        this.projects.set(projectsList);
        this.loading = false;
        
        // Fetch analyses and reviews details for each project
        projectsList.forEach(project => {
          this.projectService.getAnalysesByProject(project.id).subscribe({
            next: (analyses) => {
              if (analyses.length > 0) {
                // Find latest completed or failed analysis
                const latestAnalysis = analyses[0];
                this.projectAnalyses.update(prev => ({ ...prev, [project.id]: latestAnalysis }));
                
                // Fetch AI review for this analysis
                this.projectService.getReviewByAnalysis(latestAnalysis.id).subscribe({
                  next: (review) => {
                    this.projectReviews.update(prev => ({ ...prev, [project.id]: review }));
                  }
                });
              }
            }
          });
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  triggerAnalysis(projectId: string) {
    this.projectService.runAnalysis(projectId).subscribe({
      next: (res) => {
        this.loadData();
      }
    });
  }

  openProject(analysisId: string) {
    this.router.navigate(['/report', analysisId]);
  }

  // Getters for status & metrics safely
  getAnalysisId(projectId: string): string | null {
    const analysis = this.projectAnalyses()[projectId];
    return analysis ? analysis.id : null;
  }

  getAnalysisStatus(projectId: string): string {
    const analysis = this.projectAnalyses()[projectId];
    return analysis ? analysis.status : 'PENDING';
  }

  getAnalysisStatusClass(projectId: string): string {
    const status = this.getAnalysisStatus(projectId).toLowerCase();
    return status === 'completed' ? 'ready' : (status === 'in_progress' ? 'processing' : 'failed');
  }

  getReviewStatus(projectId: string): string {
    const review = this.projectReviews()[projectId];
    return review ? review.status : 'NOT_STARTED';
  }

  getReviewStatusClass(projectId: string): string {
    const status = this.getReviewStatus(projectId).toLowerCase();
    return status === 'completed' ? 'ready' : (status === 'in_progress' ? 'processing' : (status === 'failed' ? 'failed' : 'not-started'));
  }

  getClassesCount(projectId: string): number {
    const analysis = this.projectAnalyses()[projectId];
    return analysis ? analysis.totalClasses : 0;
  }

  getMethodsCount(projectId: string): number {
    const analysis = this.projectAnalyses()[projectId];
    return analysis ? analysis.totalMethods : 0;
  }
}
