import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectService } from '../../core/services/project.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { ProjectInfo } from '../../core/models/project.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTabsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Submit for Review</h1>
        <p class="subtitle">Upload your Java project ZIP archive or write a code snippet for AI analysis.</p>
      </div>

      <mat-card class="main-card">
        <mat-card-content>
          <mat-tab-group animationDuration="0ms" class="custom-tabs">
            <!-- ZIP Project Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">folder_zip</mat-icon> ZIP Project
              </ng-template>
              
              <div class="upload-container" *ngIf="!uploading && !processing">
                <div class="drag-drop-zone" 
                     (dragover)="onDragOver($event)" 
                     (dragleave)="onDragLeave($event)" 
                     (drop)="onDrop($event)"
                     (click)="fileInput.click()"
                     [class.dragging]="isDragging">
                  <mat-icon class="large-icon">cloud_upload</mat-icon>
                  <h3>Drag & Drop your project ZIP here</h3>
                  <p>or click to browse files from your computer (Java projects supported)</p>
                  <input type="file" #fileInput (change)="onFileSelected($event)" accept=".zip" style="display: none">
                </div>
              </div>

              <!-- Uploading and Processing Progress -->
              <div class="progress-wrapper" *ngIf="uploading || processing">
                <div class="progress-header">
                  <h3>Processing: {{ fileName }}</h3>
                  <span class="status-badge" [class.success]="currentStep === 5">{{ getStepStatusText() }}</span>
                </div>
                <mat-progress-bar [mode]="progressMode" [value]="uploadProgress" class="progress-bar"></mat-progress-bar>
                
                <div class="steps-list">
                  <div class="step-item" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
                    <mat-icon class="step-icon">{{ currentStep > 1 ? 'check_circle' : 'pending' }}</mat-icon>
                    <span class="step-text">Uploading project archive ({{ uploadProgress }}%)</span>
                  </div>
                  <div class="step-item" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
                    <mat-icon class="step-icon">{{ currentStep > 2 ? 'check_circle' : (currentStep === 2 ? 'sync' : 'pending') }}</mat-icon>
                    <span class="step-text">Extracting and mapping workspace folder structure</span>
                  </div>
                  <div class="step-item" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
                    <mat-icon class="step-icon">{{ currentStep > 3 ? 'check_circle' : (currentStep === 3 ? 'sync' : 'pending') }}</mat-icon>
                    <span class="step-text">Running JavaParser code analysis</span>
                  </div>
                  <div class="step-item" [class.active]="currentStep === 4" [class.completed]="currentStep > 4">
                    <mat-icon class="step-icon">{{ currentStep > 4 ? 'check_circle' : (currentStep === 4 ? 'sync' : 'pending') }}</mat-icon>
                    <span class="step-text">Generating structured AI review report</span>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Single File Text Editor Tab (Fallback) -->
            <mat-tab disabled>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">description</mat-icon> Single File
              </ng-template>
            </mat-tab>

            <!-- GitHub Repository Tab (Placeholder) -->
            <mat-tab disabled>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">source</mat-icon> GitHub Repository
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding-top: 10px; }
    .page-header { margin-bottom: 24px; h1 { margin: 0; font-size: 26px; font-weight: 600; color: #24292f; } .subtitle { color: #57606a; margin-top: 6px; font-size: 14px; } }
    .main-card { background-color: #ffffff; border: 1px solid #d0d7de; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px; }
    .tab-icon { margin-right: 8px; vertical-align: middle; }
    .upload-container { padding: 24px 0 8px 0; }
    .drag-drop-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      border: 2px dashed #d0d7de;
      border-radius: 8px;
      background-color: #f6f8fa;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #57606a;
      
      &:hover, &.dragging {
        border-color: #0969da;
        background-color: rgba(9, 105, 218, 0.02);
        color: #0969da;
        .large-icon { color: #0969da; }
      }
    }
    .large-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 16px; color: #afb8c1; transition: color 0.2s ease; }
    .drag-drop-zone h3 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; }
    .drag-drop-zone p { margin: 0; font-size: 13px; }
    
    /* Progress state styles */
    .progress-wrapper { padding: 32px 16px; }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      h3 { margin: 0; font-size: 16px; font-weight: 600; color: #24292f; }
    }
    .status-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      background-color: #eaeef2;
      color: #57606a;
      &.success {
        background-color: #dafbe1;
        color: #1a7f37;
      }
    }
    .progress-bar { height: 6px; border-radius: 3px; margin-bottom: 32px; }
    .steps-list { display: flex; flex-direction: column; gap: 20px; }
    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #8c959f;
      font-size: 14px;
      transition: color 0.2s ease;
      
      .step-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #afb8c1;
      }
      
      &.active {
        color: #0969da;
        font-weight: 600;
        .step-icon {
          color: #0969da;
          animation: pulse 1.5s infinite ease-in-out;
        }
      }
      &.completed {
        color: #1a7f37;
        .step-icon {
          color: #1a7f37;
        }
      }
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class UploadComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isDragging = false;
  uploading = false;
  processing = false;
  fileName = '';
  uploadProgress = 0;
  currentStep = 0; // Steps: 1: Uploading, 2: Extracting/Mapping, 3: Analyzing, 4: AI Reviewing, 5: Done
  progressMode: 'determinate' | 'indeterminate' = 'determinate';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.name.endsWith('.zip')) {
      this.snackBar.open('Only ZIP archives are supported.', 'Close', { duration: 4000 });
      return;
    }

    this.fileName = file.name;
    this.uploading = true;
    this.uploadProgress = 0;
    this.currentStep = 1;
    this.progressMode = 'determinate';

    this.projectService.uploadProject(file).subscribe({
      next: (event: HttpEvent<ProjectInfo>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const projectInfo = event.body as ProjectInfo;
          this.startProcessingStages(projectInfo);
        }
      },
      error: (err) => {
        this.resetUploadState();
        this.snackBar.open('Upload failed. Please check backend connection.', 'Close', { duration: 5000 });
      }
    });
  }

  private startProcessingStages(projectInfo: ProjectInfo) {
    this.uploading = false;
    this.processing = true;
    this.uploadProgress = 100;
    this.currentStep = 2;
    this.progressMode = 'indeterminate';

    // Since database is created and ZIP is extracted, trigger runAnalysis
    this.currentStep = 3;
    this.projectService.runAnalysis(projectInfo.id).subscribe({
      next: (analysisRes) => {
        this.currentStep = 4;
        
        // Trigger AI Review generation
        this.projectService.generateReview(analysisRes.analysisId).subscribe({
          next: (reviewRes) => {
            this.currentStep = 5;
            this.snackBar.open('Review completed successfully!', 'Close', { duration: 3000 });
            
            // Automatically navigate to report details after completion
            setTimeout(() => {
              this.router.navigate(['/report', analysisRes.analysisId]);
            }, 1000);
          },
          error: (err) => {
            this.resetUploadState();
            this.snackBar.open('AI Review generation failed.', 'Close', { duration: 5000 });
          }
        });
      },
      error: (err) => {
        this.resetUploadState();
        this.snackBar.open('Project structural analysis failed.', 'Close', { duration: 5000 });
      }
    });
  }

  private resetUploadState() {
    this.uploading = false;
    this.processing = false;
    this.uploadProgress = 0;
    this.currentStep = 0;
  }

  getStepStatusText(): string {
    switch (this.currentStep) {
      case 1: return 'Uploading...';
      case 2: return 'Extracting...';
      case 3: return 'Analyzing code...';
      case 4: return 'AI Reviewing...';
      case 5: return 'Completed';
      default: return 'Pending';
    }
  }
}
