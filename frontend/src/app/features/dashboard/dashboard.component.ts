import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterLink, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of your AI code reviews and platform status.</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <div class="stat-info">
              <span class="stat-label">Total Reviews</span>
              <span class="stat-value">128</span>
            </div>
            <div class="stat-icon-wrapper blue">
              <mat-icon>analytics</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <div class="stat-info">
              <span class="stat-label">Issues Found</span>
              <span class="stat-value">45</span>
            </div>
            <div class="stat-icon-wrapper red">
              <mat-icon>bug_report</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content class="stat-content">
            <div class="stat-info">
              <span class="stat-label">Clean Files</span>
              <span class="stat-value">83</span>
            </div>
            <div class="stat-icon-wrapper green">
              <mat-icon>check_circle</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="sections-grid">
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content class="actions-content">
            <button mat-flat-button color="primary" routerLink="/upload" class="action-btn">
              <mat-icon>cloud_upload</mat-icon> New Code Review
            </button>
            <button mat-stroked-button routerLink="/history" class="action-btn">
              <mat-icon>history</mat-icon> View History
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list">
              <div class="activity-item">
                <mat-icon class="text-success">check_circle</mat-icon>
                <div class="activity-details">
                  <span class="activity-title">UserService.java</span>
                  <span class="activity-time">2 hours ago</span>
                </div>
              </div>
              <div class="activity-item">
                <mat-icon class="text-warn">warning</mat-icon>
                <div class="activity-details">
                  <span class="activity-title">DatabaseConfig.java</span>
                  <span class="activity-time">5 hours ago</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; h1 { margin: 0; font-size: 28px; font-weight: 600; } .subtitle { color: #8b949e; margin-top: 8px; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .stat-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; }
    .stat-content { display: flex; justify-content: space-between; align-items: center; padding: 24px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-label { color: #8b949e; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: 600; color: #c9d1d9; }
    .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; mat-icon { font-size: 24px; width: 24px; height: 24px; } }
    .stat-icon-wrapper.blue { background-color: rgba(88, 166, 255, 0.1); color: #58a6ff; }
    .stat-icon-wrapper.red { background-color: rgba(248, 81, 73, 0.1); color: #f85149; }
    .stat-icon-wrapper.green { background-color: rgba(46, 160, 67, 0.1); color: #2ea043; }
    .sections-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .section-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; }
    .actions-content { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
    .action-btn { justify-content: flex-start; padding: 24px 16px; mat-icon { margin-right: 12px; } }
    .activity-list { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
    .activity-item { display: flex; align-items: center; gap: 16px; padding: 12px; border: 1px solid #30363d; border-radius: 6px; background-color: #0d1117; }
    .activity-details { display: flex; flex-direction: column; .activity-title { font-weight: 500; } .activity-time { font-size: 12px; color: #8b949e; } }
    .text-success { color: #2ea043; }
    .text-warn { color: #d29922; }
  `]
})
export class DashboardComponent {}
