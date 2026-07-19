import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
        <p class="subtitle">Upload your Java project ZIP archive for real-time code analysis and AI review.</p>
      </div>

      <mat-card class="main-card">
        <mat-card-content>
          <mat-tab-group animationDuration="0ms" class="custom-tabs">
            <!-- ZIP Project Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">folder_zip</mat-icon> ZIP Project
              </ng-template>
              
              <div class="upload-container" *ngIf="!uploading">
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

              <!-- Upload Progress -->
              <div class="progress-wrapper" *ngIf="uploading">
                <div class="progress-header">
                  <h3>Uploading: {{ fileName }}</h3>
                  <span class="status-badge uploading">Uploading</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="uploadProgress" class="progress-bar mb-16"></mat-progress-bar>
                <p class="progress-text">Uploading ZIP file to server... {{ uploadProgress }}%</p>
              </div>
            </mat-tab>

            <!-- Disabled single file / repo placeholders -->
            <mat-tab disabled>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">description</mat-icon> Single File
              </ng-template>
            </mat-tab>

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
      &.uploading {
        background-color: #ddf4ff;
        color: #0969da;
      }
    }
    .progress-bar { height: 6px; border-radius: 3px; }
    .progress-text { font-size: 13px; color: #57606a; margin: 0; }
    .mb-16 { margin-bottom: 16px; }
  `]
})
export class UploadComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isDragging = false;
  uploading = false;
  fileName = '';
  uploadProgress = 0;

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

    this.projectService.uploadProject(file).subscribe({
      next: (event: HttpEvent<{ projectId: string; jobId: string }>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const body = event.body;
          if (body && body.jobId) {
            this.snackBar.open('Upload completed. Starting code analysis...', 'Close', { duration: 2000 });
            this.router.navigate(['/processing', body.jobId]);
          } else {
            this.uploading = false;
            this.snackBar.open('Invalid response payload from server.', 'Close', { duration: 4000 });
          }
        }
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open('Upload failed. Check backend connection.', 'Close', { duration: 5000 });
      }
    });
  }
}
