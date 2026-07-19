import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSlideToggleModule, ReactiveFormsModule, MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Settings</h1>
        <p class="subtitle">Manage application preferences and AI configuration.</p>
      </div>

      <div class="settings-layout">
        <div class="settings-sidebar">
          <div class="settings-nav-item active">General</div>
          <div class="settings-nav-item">AI Model</div>
          <div class="settings-nav-item">Advanced</div>
        </div>

        <div class="settings-content">
          <mat-card class="main-card">
            <mat-card-content class="form-content">
              <form [formGroup]="settingsForm">
                
                <h3 class="section-title">Backend Connection</h3>
                <p class="section-desc">Configure where the UI connects to the Spring Boot API.</p>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>API Base URL</mat-label>
                  <input matInput formControlName="backendUrl">
                  <mat-icon matSuffix>link</mat-icon>
                </mat-form-field>

                <mat-divider class="my-24"></mat-divider>

                <h3 class="section-title">AI Engine Configuration</h3>
                <p class="section-desc">Select the local model running on Ollama.</p>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Default Model</mat-label>
                  <mat-select formControlName="aiModel">
                    <mat-option value="qwen2.5-coder:7b">Qwen 2.5 Coder (7B) - Recommended</mat-option>
                    <mat-option value="llama3:8b">Llama 3 (8B)</mat-option>
                    <mat-option value="mistral:7b">Mistral (7B)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-divider class="my-24"></mat-divider>

                <h3 class="section-title">Review Preferences</h3>
                <p class="section-desc">Adjust how deeply the AI analyzes your code.</p>

                <div class="toggle-row">
                  <div>
                    <div class="toggle-title">Strict Mode</div>
                    <div class="toggle-desc">Fail the review if high-severity security issues are found.</div>
                  </div>
                  <mat-slide-toggle formControlName="strictMode" color="primary"></mat-slide-toggle>
                </div>

                <div class="toggle-row mt-16">
                  <div>
                    <div class="toggle-title">Include Refactoring</div>
                    <div class="toggle-desc">Ask the AI to generate alternative code snippets.</div>
                  </div>
                  <mat-slide-toggle formControlName="includeRefactoring" color="primary"></mat-slide-toggle>
                </div>

                <mat-form-field appearance="outline" class="full-width mt-24">
                  <mat-label>Request Timeout (seconds)</mat-label>
                  <input matInput type="number" formControlName="timeout">
                </mat-form-field>

                <div class="actions">
                  <button mat-flat-button color="primary">Save Changes</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; h1 { margin: 0; font-size: 28px; font-weight: 600; } .subtitle { color: #8b949e; margin-top: 8px; } }
    .settings-layout { display: flex; gap: 32px; }
    .settings-sidebar { width: 200px; display: flex; flex-direction: column; gap: 4px; }
    .settings-nav-item { padding: 8px 16px; border-radius: 6px; cursor: pointer; color: #8b949e; font-weight: 500; transition: background-color 0.2s; }
    .settings-nav-item:hover { background-color: rgba(177, 186, 196, 0.12); color: #c9d1d9; }
    .settings-nav-item.active { background-color: rgba(177, 186, 196, 0.12); color: #c9d1d9; border-left: 3px solid #58a6ff; border-top-left-radius: 0; border-bottom-left-radius: 0; }
    .settings-content { flex: 1; }
    .main-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; }
    .form-content { padding: 32px; }
    .section-title { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
    .section-desc { color: #8b949e; font-size: 13px; margin: 0 0 20px 0; }
    .full-width { width: 100%; }
    .my-24 { margin: 32px 0; border-top-color: #30363d; }
    .mt-24 { margin-top: 24px; }
    .mt-16 { margin-top: 16px; }
    .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #30363d; border-radius: 6px; background-color: #0d1117; }
    .toggle-title { font-weight: 500; color: #c9d1d9; }
    .toggle-desc { font-size: 12px; color: #8b949e; margin-top: 4px; }
    .actions { display: flex; justify-content: flex-end; margin-top: 32px; padding-top: 24px; border-top: 1px solid #30363d; }
  `]
})
export class SettingsComponent {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      backendUrl: ['http://localhost:8080'],
      aiModel: ['qwen2.5-coder:7b'],
      strictMode: [false],
      includeRefactoring: [true],
      timeout: [120]
    });
  }
}
