import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReviewService } from '../../core/services/review.service';
import { ReviewResponse } from '../../core/models/review.model';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatChipsModule, RouterLink
  ],
  template: `
    <div class="page-container" *ngIf="report">
      <div class="breadcrumb">
        <a routerLink="/history">History</a>
        <mat-icon>chevron_right</mat-icon>
        <span>Report #{{ report.submissionId }}</span>
      </div>

      <div class="header-actions">
        <div>
          <h1>Code Analysis Report</h1>
          <div class="meta-info">
            <span class="meta-item"><mat-icon>calendar_today</mat-icon> {{ report.createdAt | date:'medium' }}</span>
            <span class="meta-item"><mat-icon>smart_toy</mat-icon> qwen2.5-coder:7b</span>
            <span class="meta-item success"><mat-icon>check_circle</mat-icon> Completed</span>
          </div>
        </div>
        <div class="action-buttons">
          <button mat-stroked-button><mat-icon>code</mat-icon> View Source</button>
          <button mat-flat-button color="primary"><mat-icon>download</mat-icon> Export PDF</button>
        </div>
      </div>

      <mat-card class="main-card mb-24">
        <mat-card-header class="section-header">
          <mat-icon mat-card-avatar class="text-primary">assignment</mat-icon>
          <mat-card-title>Executive Summary</mat-card-title>
        </mat-card-header>
        <mat-divider></mat-divider>
        <mat-card-content class="section-content">
          <p class="summary-text">{{ report.overallSummary }}</p>
        </mat-card-content>
      </mat-card>

      <div class="grid-2-col mb-24">
        <mat-card class="main-card issue-card">
          <mat-card-header class="section-header">
            <mat-icon mat-card-avatar class="text-error">bug_report</mat-icon>
            <mat-card-title>Bugs & Defects</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content class="section-content">
            <div class="markdown-body">{{ report.bugs }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="main-card issue-card">
          <mat-card-header class="section-header">
            <mat-icon mat-card-avatar class="text-warn">security</mat-icon>
            <mat-card-title>Security Vulnerabilities</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content class="section-content">
            <div class="markdown-body">{{ report.securityIssues }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="main-card issue-card">
          <mat-card-header class="section-header">
            <mat-icon mat-card-avatar class="text-info">speed</mat-icon>
            <mat-card-title>Performance Issues</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content class="section-content">
            <div class="markdown-body">{{ report.performanceIssues }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="main-card issue-card">
          <mat-card-header class="section-header">
            <mat-icon mat-card-avatar class="text-success">build</mat-icon>
            <mat-card-title>Maintainability</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content class="section-content">
            <div class="markdown-body">{{ report.maintainabilityIssues }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="main-card">
        <mat-card-header class="section-header">
          <mat-icon mat-card-avatar class="text-accent">lightbulb</mat-icon>
          <mat-card-title>Refactoring Suggestions</mat-card-title>
        </mat-card-header>
        <mat-divider></mat-divider>
        <mat-card-content class="section-content">
          <div class="markdown-body">{{ report.refactoringSuggestions }}</div>
        </mat-card-content>
      </mat-card>
    </div>
    
    <div class="loading-state" *ngIf="!report">
      <mat-icon class="spin">sync</mat-icon>
      <p>Loading report...</p>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding-bottom: 40px; }
    .breadcrumb { display: flex; align-items: center; color: #8b949e; font-size: 14px; margin-bottom: 16px; a { color: #58a6ff; text-decoration: none; &:hover { text-decoration: underline; } } mat-icon { font-size: 18px; width: 18px; height: 18px; margin: 0 4px; } }
    .header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; } }
    .meta-info { display: flex; gap: 16px; color: #8b949e; font-size: 13px; }
    .meta-item { display: flex; align-items: center; mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 6px; } }
    .meta-item.success { color: #3fb950; }
    .action-buttons { display: flex; gap: 12px; }
    .mb-24 { margin-bottom: 24px; }
    .main-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; }
    .section-header { padding: 16px 24px; mat-card-title { font-size: 16px; font-weight: 600; margin: 0; padding-top: 4px; } }
    .section-content { padding: 24px; }
    .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .issue-card { height: 100%; display: flex; flex-direction: column; }
    .text-primary { color: #58a6ff; }
    .text-error { color: #f85149; }
    .text-warn { color: #d29922; }
    .text-info { color: #2f81f7; }
    .text-success { color: #2ea043; }
    .text-accent { color: #bc8cff; }
    .summary-text { font-size: 15px; line-height: 1.6; color: #c9d1d9; margin: 0; }
    .markdown-body { white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #c9d1d9; }
    mat-divider { border-top-color: #30363d; }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: #8b949e; .spin { animation: spin 1s linear infinite; font-size: 32px; width: 32px; height: 32px; margin-bottom: 16px; } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class ReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);

  report: ReviewResponse | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reviewService.getReview(+id).subscribe({
        next: (data) => {
          this.report = data;
        },
        error: () => {
          console.error('Failed to load report');
        }
      });
    }
  }
}
