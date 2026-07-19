import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UploadService } from '../../core/services/upload.service';
import { ReviewService } from '../../core/services/review.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
        <p class="subtitle">Upload your code or connect a repository for AI analysis.</p>
      </div>

      <mat-card class="main-card">
        <mat-card-content>
          <mat-tab-group animationDuration="0ms" class="custom-tabs">
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">description</mat-icon> Single File
              </ng-template>
              
              <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="upload-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Filename</mat-label>
                    <input matInput formControlName="filename" placeholder="e.g., UserService.java">
                    <mat-icon matPrefix>insert_drive_file</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Language</mat-label>
                    <input matInput formControlName="language" placeholder="e.g., java">
                    <mat-icon matPrefix>code</mat-icon>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width code-editor">
                  <mat-label>Source Code</mat-label>
                  <textarea matInput formControlName="sourceCode" rows="18" placeholder="Paste your code here..."></textarea>
                </mat-form-field>

                <div class="actions">
                  <button mat-flat-button color="primary" type="submit" [disabled]="uploadForm.invalid || isSubmitting" class="submit-btn">
                    <mat-icon>auto_awesome</mat-icon>
                    {{ isSubmitting ? 'Analyzing...' : 'Generate AI Review' }}
                  </button>
                </div>
                
                <mat-progress-bar mode="indeterminate" *ngIf="isSubmitting" class="mt-16"></mat-progress-bar>
              </form>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">folder_zip</mat-icon> ZIP Project
              </ng-template>
              <div class="placeholder-content">
                <mat-icon class="large-icon">inventory_2</mat-icon>
                <h3>Upload Project Archive</h3>
                <p>ZIP project analysis is currently under development.</p>
                <button mat-stroked-button disabled>Select ZIP File</button>
              </div>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">source</mat-icon> GitHub Repository
              </ng-template>
              <div class="placeholder-content">
                <mat-icon class="large-icon">fork_right</mat-icon>
                <h3>Connect Repository</h3>
                <p>GitHub integration will be available in the next release.</p>
                <button mat-stroked-button disabled>Connect GitHub</button>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; h1 { margin: 0; font-size: 28px; font-weight: 600; } .subtitle { color: #8b949e; margin-top: 8px; } }
    .main-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; }
    .tab-icon { margin-right: 8px; }
    .upload-form { display: flex; flex-direction: column; padding: 24px 0 0 0; }
    .form-row { display: flex; gap: 16px; margin-bottom: 8px; }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
    .code-editor textarea { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.5; color: #c9d1d9; }
    .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
    .submit-btn { padding: 0 24px; height: 40px; }
    .mt-16 { margin-top: 16px; }
    .placeholder-content { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 0; color: #8b949e; }
    .large-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; color: #30363d; }
    .placeholder-content h3 { margin: 0 0 8px 0; color: #c9d1d9; }
    .placeholder-content p { margin: 0 0 24px 0; }
  `]
})
export class UploadComponent {
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  uploadForm: FormGroup = this.fb.group({
    filename: ['', Validators.required],
    language: ['java', Validators.required],
    sourceCode: ['', Validators.required]
  });

  isSubmitting = false;

  onSubmit() {
    if (this.uploadForm.valid) {
      this.isSubmitting = true;
      this.uploadService.submitCode(this.uploadForm.value).subscribe({
        next: (res) => {
          this.snackBar.open('Code uploaded successfully. AI is reviewing...', 'Close', { duration: 3000 });
          this.reviewService.generateReview(res.submissionId).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.router.navigate(['/report', res.submissionId]);
            },
            error: (err) => {
              this.isSubmitting = false;
              this.snackBar.open('Failed to generate review. Check backend connection.', 'Close', { duration: 5000 });
            }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open('Failed to submit code.', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
