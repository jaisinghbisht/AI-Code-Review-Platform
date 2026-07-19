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
        <div class="drawer-main-content">
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
        </div>

        <!-- Pinned Bottom User Details Section -->
        <div class="user-footer">
          <div class="user-info">
            <span class="user-name">Jai Singh Bisht</span>
            <span class="user-email">{{ 'jaisinghbisht.lko@gmail.com' }}</span>
          </div>
          <div class="social-links">
            <a href="https://linkedin.com/in/jaisinghbisht" target="_blank" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://github.com/jaisinghbisht" target="_blank" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://leetcode.com/jaisinghbisht" target="_blank" title="LeetCode">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.67 9.67a1.374 1.374 0 0 0 0 1.94l9.67 9.67a1.374 1.374 0 0 0 1.94 0l9.67-9.67a1.374 1.374 0 0 0 0-1.94l-9.67-9.67A1.374 1.374 0 0 0 13.483 0zm1.79 5.6a.91.91 0 0 1 .643.276c.168.175.263.411.263.658a.913.913 0 0 1-.263.659l-6.422 6.422a.932.932 0 0 1-1.302 0l-3.238-3.238a.932.932 0 0 1 0-1.302.91.91 0 0 1 1.302 0l2.587 2.587L14.63 5.876a.91.91 0 0 1 .643-.276zm-3.565 6.425a.91.91 0 0 1 .643.276c.168.175.263.411.263.658a.913.913 0 0 1-.263.659l-3.238 3.238a.932.932 0 0 1-1.302 0l-1.618-1.618a.932.932 0 0 1 0-1.302.91.91 0 0 1 1.302 0l.968.968 2.597-2.597a.91.91 0 0 1 .643-.276z"/>
              </svg>
            </a>
          </div>
        </div>
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
          
          <!-- Functional Theme Switcher Button -->
          <button mat-icon-button class="theme-indicator-btn" (click)="toggleTheme()" [class.dark]="isDarkMode()">
            <mat-icon>{{ isDarkMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: width 0.2s ease-in-out;
    }
    .drawer-main-content {
      display: flex;
      flex-direction: column;
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
    .theme-indicator-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #d0d7de;
      color: #d29922;
      background-color: #fff8c5;
      transition: all 0.2s ease;
      
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      
      &.dark {
        color: #58a6ff;
        background-color: rgba(88, 166, 255, 0.1);
        border-color: #30363d;
      }
    }
    .content-wrapper {
      padding: 24px;
      height: calc(100vh - 64px);
      box-sizing: border-box;
      overflow-y: auto;
      background-color: #f6f8fa;
    }
    
    /* Footer styles */
    .user-footer {
      padding: 16px 24px;
      border-top: 1px solid #d0d7de;
      background-color: #f6f8fa;
      display: flex;
      flex-direction: column;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 12px;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #24292f;
    }
    .user-email {
      font-size: 11px;
      color: #57606a;
      word-break: break-all;
    }
    .social-links {
      display: flex;
      gap: 16px;
      a {
        color: #57606a;
        transition: color 0.2s ease;
        display: flex;
        align-items: center;
        &:hover {
          color: #0969da;
        }
        svg {
          width: 18px;
          height: 18px;
        }
      }
    }
  `]
})
export class LayoutComponent {
  sidenavOpened = signal<boolean>(true);
  isDarkMode = signal<boolean>(false);

  toggleSidenav() {
    this.sidenavOpened.set(!this.sidenavOpened());
  }

  toggleTheme() {
    const nextMode = !this.isDarkMode();
    this.isDarkMode.set(nextMode);
    if (nextMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
