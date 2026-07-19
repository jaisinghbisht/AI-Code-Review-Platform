import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="logo-container">
          <mat-icon>code</mat-icon>
          <span>AI Code Review</span>
        </div>
        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/upload" routerLinkActive="active-link">
            <mat-icon matListItemIcon>cloud_upload</mat-icon>
            <span matListItemTitle>Upload</span>
          </a>
          <a mat-list-item routerLink="/history" routerLinkActive="active-link">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>History</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <mat-toolbar class="top-toolbar">
          <span class="spacer"></span>
          <div class="model-indicator">
            <mat-icon>smart_toy</mat-icon>
            <span>qwen2.5-coder:7b</span>
          </div>
          <div class="theme-indicator">
            <mat-icon>dark_mode</mat-icon>
          </div>
          <button mat-icon-button routerLink="/settings">
            <mat-icon>settings</mat-icon>
          </button>
        </mat-toolbar>
        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: #0d1117; /* GitHub Dark Dimmed background */
    }
    .sidenav {
      width: 260px;
      background-color: #161b22;
      border-right: 1px solid #30363d;
      color: #c9d1d9;
    }
    .logo-container {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid #30363d;
      mat-icon { margin-right: 12px; color: #58a6ff; }
    }
    .nav-list {
      padding-top: 16px;
    }
    .active-link {
      background-color: rgba(177, 186, 196, 0.12);
      border-left: 3px solid #58a6ff;
    }
    .top-toolbar {
      background-color: #161b22;
      border-bottom: 1px solid #30363d;
      color: #c9d1d9;
    }
    .spacer { flex: 1 1 auto; }
    .model-indicator, .theme-indicator {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      margin-right: 16px;
      border: 1px solid #30363d;
      color: #8b949e;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 6px; }
    }
    .theme-indicator { margin-right: 8px; mat-icon { margin-right: 0; } }
    .content-wrapper {
      padding: 32px;
      height: calc(100vh - 64px);
      box-sizing: border-box;
      overflow-y: auto;
      color: #c9d1d9;
    }
  `]
})
export class LayoutComponent {}
