import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatSnackBarModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Analyzing Project</h1>
        <p class="subtitle">Please wait while the platform inspects code metrics and generates AI code reviews.</p>
      </div>

      <mat-card class="main-card">
        <mat-card-content class="processing-content">
          <!-- Live Status Summary -->
          <div class="status-summary mb-24">
            <div class="status-main">
              <mat-icon class="spin-icon" [class.error]="status() === 'FAILED'" [class.success]="status() === 'COMPLETED'">
                {{ getStatusIcon() }}
              </mat-icon>
              <div class="status-text-wrapper">
                <h3>{{ currentStepText() }}</h3>
                <span class="status-badge" [ngClass]="status().toLowerCase()">{{ status() }}</span>
              </div>
            </div>
            
            <div class="timer-box">
              <div class="time-item">
                <span class="time-label">Elapsed</span>
                <span class="time-value">{{ elapsedSeconds() }}s</span>
              </div>
              <div class="time-divider"></div>
              <div class="time-item">
                <span class="time-label">Remaining (Est.)</span>
                <span class="time-value">{{ getRemainingTimeText() }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <mat-progress-bar [mode]="progress() > 0 && status() !== 'FAILED' ? 'determinate' : 'indeterminate'" 
                            [value]="progress()" 
                            [color]="status() === 'FAILED' ? 'warn' : 'primary'"
                            class="progress-bar mb-32">
          </mat-progress-bar>

          <!-- Vertical Processing Stepper -->
          <div class="stepper">
            <div class="step-item" [class.active]="isStepActive(1)" [class.completed]="isStepCompleted(1)">
              <div class="step-line"></div>
              <mat-icon class="step-icon">{{ isStepCompleted(1) ? 'check_circle' : 'inventory_2' }}</mat-icon>
              <div class="step-details">
                <h4>Extracting Project Archive</h4>
                <p>Unzipping code packages and setting up build context.</p>
              </div>
            </div>

            <div class="step-item" [class.active]="isStepActive(2)" [class.completed]="isStepCompleted(2)">
              <div class="step-line"></div>
              <mat-icon class="step-icon">{{ isStepCompleted(2) ? 'check_circle' : 'search' }}</mat-icon>
              <div class="step-details">
                <h4>Scanning Workspace</h4>
                <p>Locating Java files, package mappings, and build files (Maven/Gradle/Spring Boot).</p>
              </div>
            </div>

            <div class="step-item" [class.active]="isStepActive(3)" [class.completed]="isStepCompleted(3)">
              <div class="step-line"></div>
              <mat-icon class="step-icon">{{ isStepCompleted(3) ? 'check_circle' : 'analytics' }}</mat-icon>
              <div class="step-details">
                <h4>JavaParser Code Analysis</h4>
                <p>Parsing classes, signatures, methods, and syntax structures into database metrics.</p>
              </div>
            </div>

            <div class="step-item" [class.active]="isStepActive(4)" [class.completed]="isStepCompleted(4)">
              <div class="step-line"></div>
              <mat-icon class="step-icon">{{ isStepCompleted(4) ? 'check_circle' : 'auto_awesome' }}</mat-icon>
              <div class="step-details">
                <h4>AI Review Generation</h4>
                <p>Prompting local LLM (qwen2.5-coder:7b) for architectural, security, and refactoring insights.</p>
              </div>
            </div>

            <div class="step-item" [class.active]="isStepActive(5)" [class.completed]="isStepCompleted(5)">
              <mat-icon class="step-icon">{{ isStepCompleted(5) ? 'check_circle' : 'flag' }}</mat-icon>
              <div class="step-details">
                <h4>Completed</h4>
                <p>Finalizing report views and reviews dashboard details.</p>
              </div>
            </div>
          </div>

          <!-- Error Message Display -->
          <div class="error-container mt-24" *ngIf="status() === 'FAILED'">
            <div class="error-header">
              <mat-icon>error_outline</mat-icon>
              <span>Analysis Pipeline Failed</span>
            </div>
            <p class="error-msg">{{ errorMessage() }}</p>
            <div class="error-actions mt-16">
              <button mat-flat-button color="primary" routerLink="/upload">
                <mat-icon>arrow_back</mat-icon> Back to Upload
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding-top: 10px; }
    .page-header { margin-bottom: 24px; h1 { margin: 0; font-size: 26px; font-weight: 600; color: #24292f; } .subtitle { color: #57606a; margin-top: 6px; font-size: 14px; } }
    .main-card { background-color: #ffffff; border: 1px solid #d0d7de; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px; }
    .processing-content { padding: 24px; }

    /* Live status header styles */
    .status-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 16px 20px;
    }
    .status-main {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .spin-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #0969da;
        animation: spin 2s linear infinite;
        
        &.error { color: #cf222e; animation: none; }
        &.success { color: #1a7f37; animation: none; }
      }
      
      .status-text-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
        h3 { margin: 0; font-size: 16px; font-weight: 600; color: #24292f; }
      }
    }
    .status-badge {
      align-self: flex-start;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 12px;
      background-color: #eaeef2;
      color: #57606a;
      
      &.completed { background-color: #dafbe1; color: #1a7f37; }
      &.failed { background-color: #ffebe9; color: #cf222e; }
      &.queued, &.extracting, &.scanning, &.analyzing, &.generating_review, &.saving {
        background-color: #ddf4ff; color: #0969da;
      }
    }
    .timer-box {
      display: flex;
      align-items: center;
      gap: 16px;
      background-color: #ffffff;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 8px 16px;
    }
    .time-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .time-label { font-size: 10px; color: #57606a; font-weight: 500; }
    .time-value { font-size: 14px; font-weight: 600; color: #24292f; margin-top: 2px; }
    .time-divider { width: 1px; height: 24px; background-color: #d0d7de; }

    .progress-bar { height: 6px; border-radius: 3px; }
    .mb-32 { margin-bottom: 32px; }
    .mb-24 { margin-bottom: 24px; }
    .mt-24 { margin-top: 24px; }
    .mt-16 { margin-top: 16px; }

    /* Vertical Stepper layout */
    .stepper { display: flex; flex-direction: column; }
    .step-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;
      
      &:last-child {
        padding-bottom: 0;
        .step-line { display: none; }
      }
      
      .step-line {
        position: absolute;
        left: 11px;
        top: 24px;
        bottom: 0;
        width: 2px;
        background-color: #eaeef2;
      }
      
      .step-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #ffffff;
        color: #afb8c1;
        z-index: 1;
      }
      
      .step-details {
        display: flex;
        flex-direction: column;
        h4 { margin: 0; font-size: 14px; font-weight: 600; color: #8c959f; }
        p { margin: 4px 0 0 0; font-size: 12px; color: #8c959f; }
      }
      
      &.active {
        .step-icon {
          color: #0969da;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .step-details {
          h4 { color: #0969da; }
          p { color: #24292f; }
        }
      }
      
      &.completed {
        .step-line { background-color: #1a7f37; }
        .step-icon { color: #1a7f37; }
        .step-details {
          h4 { color: #1a7f37; }
          p { color: #57606a; }
        }
      }
    }

    /* Error details container */
    .error-container {
      background-color: #ffebe9;
      border: 1px solid rgba(207, 34, 46, 0.4);
      border-radius: 6px;
      padding: 16px;
      color: #cf222e;
    }
    .error-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .error-msg { margin: 8px 0 0 0; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; }

    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class ProcessingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // States
  status = signal<string>('QUEUED');
  progress = signal<number>(0);
  currentStepText = signal<string>('Queued in processing pool');
  errorMessage = signal<string>('');
  elapsedSeconds = signal<number>(0);
  estimatedRemainingMs = signal<number>(25000);

  private eventSource: EventSource | null = null;
  private timerInterval: any = null;
  projectId: string | null = null;

  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (jobId) {
      this.connectToEvents(jobId);
      this.startTimer();
    } else {
      this.snackBar.open('No Job ID found.', 'Close', { duration: 4000 });
      this.router.navigate(['/upload']);
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private connectToEvents(jobId: string) {
    this.eventSource = new EventSource(`/api/jobs/${jobId}/events`);
    
    this.eventSource.addEventListener('progress', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        this.status.set(data.status);
        this.progress.set(data.percentage);
        this.currentStepText.set(data.currentStep);
        this.errorMessage.set(data.errorMessage || '');
        this.projectId = data.projectId;
        this.estimatedRemainingMs.set(data.estimatedRemainingMs || 0);

        if (data.status === 'COMPLETED') {
          this.cleanup();
          this.snackBar.open('Project analysis completed successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/report', data.projectId]);
        } else if (data.status === 'FAILED') {
          this.cleanup();
          this.snackBar.open('Analysis failed: ' + (data.errorMessage || 'Unknown error'), 'Close', { duration: 5000 });
        }
      } catch (e) {
        console.error('Error parsing SSE event data', e);
      }
    });

    this.eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      // Wait for it, native EventSource auto-reconnects. But if job fails/completes we closed it.
    };
  }

  private startTimer() {
    const start = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.set(Math.round((Date.now() - start) / 1000));
    }, 1000);
  }

  private cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Stepper UI helper methods
  getStepIndex(): number {
    switch (this.status()) {
      case 'QUEUED': return 0;
      case 'EXTRACTING': return 1;
      case 'SCANNING': return 2;
      case 'ANALYZING': return 3;
      case 'GENERATING_REVIEW': return 4;
      case 'SAVING': return 4;
      case 'COMPLETED': return 5;
      case 'FAILED': return -1;
      default: return 0;
    }
  }

  isStepActive(step: number): boolean {
    if (this.status() === 'FAILED') return false;
    return this.getStepIndex() === step;
  }

  isStepCompleted(step: number): boolean {
    if (this.status() === 'FAILED') return false;
    return this.getStepIndex() > step;
  }

  getStatusIcon(): string {
    if (this.status() === 'FAILED') return 'error';
    if (this.status() === 'COMPLETED') return 'check_circle';
    return 'sync';
  }

  getRemainingTimeText(): string {
    if (this.status() === 'FAILED' || this.status() === 'COMPLETED') return '0s';
    const seconds = Math.max(0, Math.round(this.estimatedRemainingMs() / 1000));
    return `${seconds}s`;
  }
}
