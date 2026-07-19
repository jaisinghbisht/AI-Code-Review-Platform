import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
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
      <!-- Collapsible navigation drawer -->
      <mat-sidenav #sidenav mode="side" [opened]="sidenavOpened()" class="sidenav">
        <div class="logo-container">
          <mat-icon class="logo-icon">code</mat-icon>
          <span class="logo-text">AI Code Review</span>
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
        <!-- Top Toolbar -->
        <mat-toolbar class="top-toolbar">
          <button mat-icon-button class="menu-toggle-btn" (click)="toggleSidenav()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="spacer"></span>
          
          <div class="model-indicator">
            <mat-icon>smart_toy</mat-icon>
            <span>qwen2.5-coder:7b</span>
          </div>
          <div class="theme-indicator">
            <mat-icon>light_mode</mat-icon>
          </div>
        </mat-toolbar>

        <!-- Main View Area -->
        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: #f6f8fa;
    }
    .sidenav {
      width: 250px;
      background-color: #ffffff;
      border-right: 1px solid #d0d7de;
      color: #24292f;
      transition: width 0.2s ease-in-out;
    }
    .logo-container {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      color: #24292f;
      font-size: 16px;
      font-weight: 600;
      border-bottom: 1px solid #d0d7de;
      .logo-icon { margin-right: 10px; color: #0969da; }
    }
    .nav-list {
      padding-top: 12px;
    }
    .active-link {
      background-color: rgba(9, 105, 218, 0.06) !important;
      border-left: 4px solid #0969da;
      color: #0969da !important;
      mat-icon { color: #0969da !important; }
    }
    .top-toolbar {
      background-color: #ffffff;
      border-bottom: 1px solid #d0d7de;
      color: #24292f;
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
    .menu-toggle-btn {
      color: #57606a;
    }
    .spacer { flex: 1 1 auto; }
    .model-indicator {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      margin-right: 16px;
      border: 1px solid #d0d7de;
      color: #57606a;
      background-color: #f6f8fa;
      mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 6px; color: #0969da; }
    }
    .theme-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #d0d7de;
      color: #d29922;
      background-color: #fff8c5;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .content-wrapper {
      padding: 24px;
      height: calc(100vh - 64px);
      box-sizing: border-box;
      overflow-y: auto;
      background-color: #f6f8fa;
    }
  `]
})
export class LayoutComponent {
  sidenavOpened = signal<boolean>(true);

  toggleSidenav() {
    this.sidenavOpened.set(!this.sidenavOpened());
  }
}
