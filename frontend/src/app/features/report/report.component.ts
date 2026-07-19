import { Component, OnInit, AfterViewChecked, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from '../../core/services/project.service';
import { ProjectInfo, ProjectAnalysis, ProjectReview, FileAnalysis, TypeDefinition, MethodDefinition } from '../../core/models/project.model';
import { MarkdownComponent } from 'ngx-markdown';
import { Chart, registerables } from 'chart.js';
import hljs from 'highlight.js';

Chart.register(...registerables);

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatChipsModule, RouterLink, MatTabsModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule, MarkdownComponent
  ],
  template: `
    <div class="page-container" *ngIf="project && analysis">
      <!-- Breadcrumbs -->
      <div class="breadcrumb">
        <a routerLink="/dashboard">Projects</a>
        <mat-icon>chevron_right</mat-icon>
        <span>{{ project.projectName }}</span>
      </div>

      <!-- Header actions -->
      <div class="header-actions">
        <div>
          <h1>{{ project.projectName }}</h1>
          <div class="meta-info">
            <span class="meta-item"><mat-icon>archive</mat-icon> {{ project.archiveName }}</span>
            <span class="meta-item"><mat-icon>calendar_today</mat-icon> Analyzed {{ analysis.analysisTimestamp | date:'medium' }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button mat-stroked-button (click)="loadData()"><mat-icon>refresh</mat-icon> Refresh</button>
        </div>
      </div>

      <!-- Tabs group -->
      <mat-tab-group (selectedIndexChange)="onTabChange($event)" class="report-tabs">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content pt-20">
            <!-- Metadata Summary cards -->
            <div class="grid-3 mb-24">
              <mat-card class="summary-card">
                <mat-card-content class="card-layout">
                  <div class="card-icon-box blue">
                    <mat-icon>code</mat-icon>
                  </div>
                  <div class="card-data">
                    <span class="card-label">Lines of Code (Est.)</span>
                    <span class="card-value">{{ project.estimatedLinesOfCode }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content class="card-layout">
                  <div class="card-icon-box green">
                    <mat-icon>insert_drive_file</mat-icon>
                  </div>
                  <div class="card-data">
                    <span class="card-label">Java Files</span>
                    <span class="card-value">{{ project.javaFiles }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="summary-card">
                <mat-card-content class="card-layout">
                  <div class="card-icon-box purple">
                    <mat-icon>inventory</mat-icon>
                  </div>
                  <div class="card-data">
                    <span class="card-label">Packages</span>
                    <span class="card-value">{{ project.packageCount }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Frameworks & Tools chips -->
            <mat-card class="mb-24">
              <mat-card-content class="flex-align-center gap-12 py-16">
                <span class="section-subtitle">Framework & Build Stack:</span>
                <mat-chip-listbox>
                  <mat-chip-option [selectable]="false" color="primary" [selected]="project.isSpringBootProject">Spring Boot</mat-chip-option>
                  <mat-chip-option [selectable]="false" color="accent" [selected]="project.isMavenProject">Maven</mat-chip-option>
                  <mat-chip-option [selectable]="false" color="warn" [selected]="project.isGradleProject">Gradle</mat-chip-option>
                  <mat-chip-option [selectable]="false" [selected]="!!project.mainClass">Executable</mat-chip-option>
                </mat-chip-listbox>
                <span class="spacer"></span>
                <span class="main-class-text" *ngIf="project.mainClass"><strong>Main Class:</strong> {{ project.mainClass }}</span>
              </mat-card-content>
            </mat-card>

            <div class="grid-2-col mb-24">
              <!-- Codebase Metrics Table -->
              <mat-card class="details-card">
                <mat-card-header class="card-header-border">
                  <mat-card-title>Codebase Metrics</mat-card-title>
                </mat-card-header>
                <mat-card-content class="p-0">
                  <table class="metrics-table">
                    <tbody>
                      <tr>
                        <td>Classes</td>
                        <td><strong>{{ analysis.totalClasses }}</strong></td>
                      </tr>
                      <tr>
                        <td>Interfaces</td>
                        <td><strong>{{ analysis.totalInterfaces }}</strong></td>
                      </tr>
                      <tr>
                        <td>Enums</td>
                        <td><strong>{{ analysis.totalEnums }}</strong></td>
                      </tr>
                      <tr>
                        <td>Records</td>
                        <td><strong>{{ analysis.totalRecords }}</strong></td>
                      </tr>
                      <tr>
                        <td>Methods</td>
                        <td><strong>{{ analysis.totalMethods }}</strong></td>
                      </tr>
                      <tr>
                        <td>Fields</td>
                        <td><strong>{{ analysis.totalFields }}</strong></td>
                      </tr>
                      <tr>
                        <td>Constructors</td>
                        <td><strong>{{ analysis.totalConstructors }}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </mat-card-content>
              </mat-card>

              <!-- Largest Classes -->
              <mat-card class="details-card">
                <mat-card-header class="card-header-border">
                  <mat-card-title>Largest Classes (by lines)</mat-card-title>
                </mat-card-header>
                <mat-card-content class="p-0">
                  <div class="largest-classes-list">
                    <div class="largest-class-item" *ngFor="let cls of largestClasses">
                      <div class="class-info">
                        <mat-icon class="class-icon">class</mat-icon>
                        <div class="class-meta">
                          <span class="class-name">{{ cls.typeName }}</span>
                          <span class="class-package">{{ cls.packageName }}</span>
                        </div>
                      </div>
                      <span class="class-lines">{{ cls.lineCount }} lines</span>
                    </div>
                    <div class="empty-list" *ngIf="largestClasses.length === 0">
                      No classes found.
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- AI Review Tab -->
        <mat-tab label="AI Review">
          <div class="tab-content pt-20">
            <!-- Review Generation Progress / Failures -->
            <div class="loading-state py-40" *ngIf="reviewLoading">
              <mat-icon class="spin">sync</mat-icon>
              <p>Fetching or generating AI review details...</p>
            </div>

            <div class="empty-state" *ngIf="!reviewLoading && !review">
              <mat-icon class="empty-icon">smart_toy</mat-icon>
              <h3>No AI Review Generated</h3>
              <p>We found code analysis results but no review. Trigger review generation to receive detailed insights.</p>
              <button mat-flat-button color="primary" (click)="generateReview()">
                <mat-icon>auto_awesome</mat-icon> Generate AI Review
              </button>
            </div>

            <!-- Review sections expansion panels -->
            <div *ngIf="!reviewLoading && review">
              <div class="review-meta-bar mb-16">
                <span><mat-icon>smart_toy</mat-icon> Model: <strong>{{ review.model || 'qwen2.5-coder:7b' }}</strong></span>
                <span><mat-icon>timer</mat-icon> Inference: <strong>{{ getExecutionTimeText(review.executionTimeMs) }}</strong></span>
              </div>
              
              <mat-accordion multi="true">
                <mat-expansion-panel *ngFor="let section of review.sections" [expanded]="section.title === 'Summary' || section.title === 'Introduction'" class="review-panel mb-12">
                  <mat-expansion-panel-header>
                    <mat-panel-title class="panel-title-row">
                      <mat-icon class="panel-icon" [ngClass]="getSectionIconColor(section.title)">
                        {{ getSectionIcon(section.title) }}
                      </mat-icon>
                      <span>{{ section.title }}</span>
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="markdown-wrapper">
                    <markdown [data]="section.content"></markdown>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>
            </div>
          </div>
        </mat-tab>

        <!-- Code Explorer Tab -->
        <mat-tab label="Code Explorer">
          <div class="tab-content pt-20 explorer-container">
            <!-- Left panel: File tree -->
            <div class="explorer-sidebar">
              <div class="sidebar-header">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Search files</mat-label>
                  <input matInput (input)="onSearchInput($event)" placeholder="e.g. Service">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>

              <div class="sidebar-list">
                <div class="package-group" *ngFor="let pkg of filteredPackages">
                  <div class="package-header" (click)="togglePackage(pkg.name)">
                    <mat-icon class="folder-icon">
                      {{ expandedPackages[pkg.name] ? 'folder_open' : 'folder' }}
                    </mat-icon>
                    <span class="package-name-text">{{ pkg.name }}</span>
                  </div>
                  
                  <div class="files-list" *ngIf="expandedPackages[pkg.name]">
                    <div class="file-item" 
                         *ngFor="let file of pkg.files"
                         [class.selected]="selectedFile?.filePath === file.filePath"
                         (click)="selectFile(file)">
                      <mat-icon class="file-icon">description</mat-icon>
                      <span class="file-name-text">{{ getFileName(file.filePath) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right panel: Code View / Details -->
            <div class="explorer-body">
              <div class="empty-state-explorer" *ngIf="!selectedFile">
                <mat-icon class="explorer-empty-icon">code</mat-icon>
                <h3>No file selected</h3>
                <p>Select a class from the file explorer on the left to inspect its structure and source code.</p>
              </div>

              <div class="code-view-container" *ngIf="selectedFile">
                <!-- File details header -->
                <div class="code-header">
                  <div class="code-header-title">
                    <h2>{{ getFileName(selectedFile.filePath) }}</h2>
                    <span class="code-pkg-path">{{ selectedFile.filePath }}</span>
                  </div>
                  <span class="line-count-badge">{{ selectedFile.lineCount }} lines</span>
                </div>

                <!-- Inner tabs (Source Code vs Metadata details) -->
                <mat-tab-group class="code-tabs">
                  <mat-tab label="Source Code">
                    <div class="code-pre-wrapper">
                      <div class="code-loader" *ngIf="codeLoading">
                        <mat-icon class="spin">sync</mat-icon>
                        <p>Reading source code...</p>
                      </div>
                      <pre *ngIf="!codeLoading"><code [innerHTML]="highlightedCode"></code></pre>
                    </div>
                  </mat-tab>
                  
                  <mat-tab label="Structure & Types">
                    <div class="type-details-tab pt-20">
                      <div class="type-def-box mb-20" *ngFor="let type of selectedFile.typeDefinitions">
                        <div class="type-def-header">
                          <span class="visibility-badge">{{ type.visibility }}</span>
                          <span class="type-kind">{{ type.type }}</span>
                          <h3 class="type-name-title">{{ type.typeName }}</h3>
                          <span class="superclass" *ngIf="type.superclassName">extends {{ type.superclassName }}</span>
                        </div>
                        <div class="type-metrics">
                          <span><strong>Fields:</strong> {{ type.fieldCount }}</span>
                          <span><strong>Methods:</strong> {{ type.methodCount }}</span>
                          <span><strong>Constructors:</strong> {{ type.constructorCount }}</span>
                        </div>
                        
                        <div class="method-definitions-list" *ngIf="type.methodDefinitions.length > 0">
                          <h4>Methods</h4>
                          <table class="method-table">
                            <thead>
                              <tr>
                                <th>Visibility</th>
                                <th>Signature</th>
                                <th>Returns</th>
                                <th>Lines</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr *ngFor="let m of type.methodDefinitions">
                                <td><span class="visibility-badge small">{{ m.visibility }}</span></td>
                                <td>
                                  <span class="method-modifiers">
                                    {{ m.isStatic ? 'static ' : '' }}{{ m.isFinal ? 'final ' : '' }}{{ m.isAbstract ? 'abstract ' : '' }}
                                  </span>
                                  <strong>{{ m.methodName }}</strong>({{ m.parameters?.join(', ') || '' }})
                                </td>
                                <td><span class="return-type-code">{{ m.returnType }}</span></td>
                                <td>{{ m.lineCount }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </mat-tab>
                </mat-tab-group>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Metrics Tab -->
        <mat-tab label="Metrics">
          <div class="tab-content pt-20">
            <div class="grid-2-col mb-24">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Types Distribution</mat-card-title>
                </mat-card-header>
                <mat-card-content class="chart-canvas-wrapper">
                  <canvas id="typesChart"></canvas>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Largest Files (LOC)</mat-card-title>
                </mat-card-header>
                <mat-card-content class="chart-canvas-wrapper">
                  <canvas id="filesChart"></canvas>
                </mat-card-content>
              </mat-card>
            </div>

            <mat-card class="chart-card mb-24">
              <mat-card-header>
                <mat-card-title>Package File Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content class="chart-canvas-wrapper wide">
                <canvas id="packageChart"></canvas>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Outer Loading State -->
    <div class="loading-state" *ngIf="loading">
      <mat-icon class="spin">sync</mat-icon>
      <p>Loading project details...</p>
    </div>
  `,
  styles: [`
    .breadcrumb { display: flex; align-items: center; color: #57606a; font-size: 13px; margin-bottom: 16px; a { color: #0969da; text-decoration: none; &:hover { text-decoration: underline; } } mat-icon { font-size: 16px; width: 16px; height: 16px; margin: 0 4px; color: #afb8c1; } }
    .header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 600; color: #24292f; } }
    .meta-info { display: flex; gap: 16px; color: #57606a; font-size: 12px; }
    .meta-item { display: flex; align-items: center; mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; color: #8c959f; } }
    .action-buttons { display: flex; gap: 12px; }
    
    .tab-content { min-height: 400px; }
    .pt-20 { padding-top: 20px; }
    .mb-24 { margin-bottom: 24px; }
    .mb-20 { margin-bottom: 20px; }
    .mb-16 { margin-bottom: 16px; }
    .mb-12 { margin-bottom: 12px; }
    .py-16 { padding-top: 16px; padding-bottom: 16px; }
    .p-0 { padding: 0 !important; }
    .gap-12 { gap: 12px; }
    .flex-align-center { display: flex; align-items: center; }
    .section-subtitle { font-size: 13px; font-weight: 600; color: #57606a; }
    .main-class-text { font-size: 13px; color: #24292f; }
    .spacer { flex: 1 1 auto; }
    
    /* Summary Card Styles */
    .summary-card {
      border: 1px solid #d0d7de !important;
      background-color: #ffffff !important;
      border-radius: 8px;
    }
    .card-layout {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
    }
    .card-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      &.blue { background-color: rgba(9, 105, 218, 0.08); color: #0969da; }
      &.green { background-color: rgba(26, 127, 55, 0.08); color: #1a7f37; }
      &.purple { background-color: rgba(130, 80, 223, 0.08); color: #8250df; }
    }
    .card-data {
      display: flex;
      flex-direction: column;
    }
    .card-label { font-size: 12px; color: #57606a; font-weight: 500; }
    .card-value { font-size: 20px; font-weight: 600; color: #24292f; margin-top: 2px; }

    /* Details Card and Tables */
    .details-card { border: 1px solid #d0d7de !important; background-color: #ffffff !important; }
    .card-header-border { border-bottom: 1px solid #d0d7de; padding: 12px 20px; mat-card-title { font-size: 14px; font-weight: 600; color: #24292f; } }
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      tr {
        border-bottom: 1px solid #f6f8fa;
        &:last-child { border-bottom: none; }
        td {
          padding: 12px 20px;
          color: #24292f;
          &:last-child { text-align: right; }
        }
      }
    }

    /* Largest classes list */
    .largest-classes-list {
      display: flex;
      flex-direction: column;
    }
    .largest-class-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #f6f8fa;
      &:last-child { border-bottom: none; }
    }
    .class-info { display: flex; align-items: center; gap: 12px; }
    .class-icon { color: #8250df; font-size: 20px; width: 20px; height: 20px; }
    .class-meta { display: flex; flex-direction: column; }
    .class-name { font-size: 13px; font-weight: 600; color: #24292f; }
    .class-package { font-size: 11px; color: #57606a; }
    .class-lines { font-size: 12px; font-weight: 500; color: #57606a; }

    /* AI Review Layout */
    .review-meta-bar {
      display: flex;
      gap: 20px;
      background-color: #f6f8fa;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 12px;
      color: #57606a;
      border: 1px solid #d0d7de;
      align-items: center;
      span { display: flex; align-items: center; gap: 4px; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    }
    .review-panel {
      border: 1px solid #d0d7de;
      border-radius: 8px !important;
      box-shadow: none !important;
      overflow: hidden;
    }
    .panel-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #24292f;
      font-size: 14px;
    }
    .panel-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      &.blue { color: #0969da; }
      &.red { color: #cf222e; }
      &.yellow { color: #9a6700; }
      &.green { color: #1a7f37; }
      &.purple { color: #8250df; }
    }
    .markdown-wrapper {
      padding: 10px 0;
      color: #24292f;
      font-size: 14px;
      line-height: 1.6;
      ::ng-deep {
        h1, h2, h3 { font-size: 16px; font-weight: 600; margin-top: 16px; margin-bottom: 8px; color: #24292f; }
        p { margin-bottom: 12px; }
        ul, ol { padding-left: 20px; margin-bottom: 12px; }
        li { margin-bottom: 4px; }
        code { font-family: monospace; background-color: #f6f8fa; padding: 2px 4px; border-radius: 4px; font-size: 12px; }
        pre { background-color: #f6f8fa; padding: 12px; border-radius: 6px; overflow-x: auto; margin-bottom: 12px; code { padding: 0; background-color: transparent; } }
      }
    }

    /* File Explorer Layout */
    .explorer-container {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 20px;
      border: 1px solid #d0d7de;
      border-radius: 8px;
      background-color: #ffffff;
      height: 600px;
      overflow: hidden;
    }
    .explorer-sidebar {
      border-right: 1px solid #d0d7de;
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #fafbfc;
    }
    .sidebar-header { padding: 12px; border-bottom: 1px solid #d0d7de; }
    .search-field { width: 100%; ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; } }
    .sidebar-list { flex: 1; overflow-y: auto; padding: 8px 0; }
    
    .package-group { margin-bottom: 4px; }
    .package-header {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      color: #57606a;
      gap: 8px;
      user-select: none;
      &:hover { background-color: #f3f4f6; }
      .folder-icon { font-size: 16px; width: 16px; height: 16px; color: #d29922; }
      .package-name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
    .files-list { padding-left: 20px; }
    .file-item {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      color: #24292f;
      gap: 6px;
      &:hover { background-color: #f3f4f6; }
      &.selected { background-color: rgba(9, 105, 218, 0.08); color: #0969da; font-weight: 500; .file-icon { color: #0969da; } }
      .file-icon { font-size: 16px; width: 16px; height: 16px; color: #8c959f; }
      .file-name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }

    .explorer-body { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .empty-state-explorer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #57606a;
      .explorer-empty-icon { font-size: 40px; width: 40px; height: 40px; color: #afb8c1; margin-bottom: 12px; }
      h3 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #24292f; }
      p { margin: 0; font-size: 12px; max-width: 320px; text-align: center; }
    }
    .code-view-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .code-header {
      padding: 16px 20px;
      border-bottom: 1px solid #d0d7de;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fafbfc;
    }
    .code-header-title {
      display: flex;
      flex-direction: column;
      h2 { margin: 0; font-size: 16px; font-weight: 600; color: #24292f; }
      .code-pkg-path { font-size: 11px; color: #57606a; margin-top: 2px; }
    }
    .line-count-badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; background-color: #eaeef2; color: #24292f; font-weight: 500; }
    
    .code-tabs { flex: 1; display: flex; flex-direction: column; overflow: hidden; ::ng-deep .mat-mdc-tab-body-wrapper { flex: 1; overflow: hidden; } ::ng-deep .mat-mdc-tab-body { display: flex; flex-direction: column; height: 100%; } }
    .code-pre-wrapper {
      flex: 1;
      padding: 16px;
      overflow: auto;
      background-color: #f6f8fa;
      height: 100%;
      box-sizing: border-box;
      
      pre { margin: 0; }
      code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 12px;
        line-height: 1.5;
      }
    }
    .code-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #57606a; .spin { animation: spin 1s linear infinite; margin-bottom: 8px; } }

    /* Type details tab */
    .type-details-tab { padding: 16px 20px; overflow-y: auto; height: 100%; box-sizing: border-box; }
    .type-def-box { border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; background-color: #ffffff; }
    .type-def-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .visibility-badge {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: rgba(9, 105, 218, 0.08);
      color: #0969da;
      &.small { font-size: 9px; padding: 1px 4px; }
    }
    .type-kind { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #57606a; }
    .type-name-title { margin: 0; font-size: 15px; font-weight: 600; color: #24292f; }
    .superclass { font-size: 12px; color: #57606a; }
    .type-metrics { display: flex; gap: 16px; font-size: 12px; color: #57606a; margin-bottom: 16px; border-bottom: 1px solid #f6f8fa; padding-bottom: 8px; }
    
    .method-definitions-list {
      h4 { margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #24292f; text-transform: uppercase; letter-spacing: 0.5px; }
    }
    .method-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      th { text-align: left; padding: 6px 10px; font-weight: 600; color: #57606a; background-color: #f6f8fa; border-bottom: 1px solid #d0d7de; }
      td { padding: 8px 10px; border-bottom: 1px solid #f6f8fa; vertical-align: middle; }
    }
    .method-modifiers { color: #cf222e; font-family: monospace; font-size: 11px; }
    .return-type-code { font-family: monospace; color: #0969da; }

    /* Chart Tab Layout */
    .chart-card { border: 1px solid #d0d7de !important; background-color: #ffffff !important; mat-card-title { font-size: 14px; font-weight: 600; } }
    .chart-canvas-wrapper {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 260px;
      &.wide { height: 320px; }
      canvas { max-width: 100%; max-height: 100%; }
    }

    /* General loading state */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      color: #57606a;
      .spin { animation: spin 1s linear infinite; font-size: 32px; width: 32px; height: 32px; margin-bottom: 12px; }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      border: 1px dashed #d0d7de;
      border-radius: 8px;
      background-color: #ffffff;
      color: #57606a;
      text-align: center;
      .empty-icon { font-size: 44px; width: 44px; height: 44px; color: #afb8c1; margin-bottom: 12px; }
      h3 { margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #24292f; }
      p { margin: 0 0 16px 0; font-size: 13px; max-width: 400px; }
    }
    .empty-list { padding: 16px 20px; color: #8c959f; font-size: 13px; text-align: center; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class ReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);

  loading = true;
  project: ProjectInfo | null = null;
  analysis: ProjectAnalysis | null = null;
  review: ProjectReview | null = null;

  largestClasses: (TypeDefinition & { packageName: string })[] = [];
  packagesList: string[] = [];

  // Review states
  reviewLoading = false;

  // Code Explorer states
  codeSearchQuery = '';
  packagesWithFiles: { name: string; files: FileAnalysis[] }[] = [];
  filteredPackages: { name: string; files: FileAnalysis[] }[] = [];
  expandedPackages: Record<string, boolean> = {};
  selectedFile: FileAnalysis | null = null;
  codeLoading = false;
  highlightedCode = '';

  // Charts
  charts: Chart[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const analysisId = this.route.snapshot.paramMap.get('id');
    if (analysisId) {
      this.projectService.getAnalysis(analysisId).subscribe({
        next: (analysisData) => {
          this.analysis = analysisData;
          this.loadProjectDetails(analysisData.projectId);
          this.processAnalysisMetadata(analysisData);
          this.loadReviewDetails(analysisData.id);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private loadProjectDetails(projectId: string) {
    this.projectService.getProject(projectId).subscribe({
      next: (projectData) => {
        this.project = projectData;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private processAnalysisMetadata(analysisData: ProjectAnalysis) {
    // 1. Calculate largest classes
    const classes: (TypeDefinition & { packageName: string })[] = [];
    analysisData.fileAnalyses.forEach(file => {
      file.typeDefinitions.forEach(type => {
        classes.push({
          ...type,
          packageName: file.packageName || '(default package)'
        });
      });
    });
    this.largestClasses = classes
      .sort((a, b) => b.lineCount - a.lineCount)
      .slice(0, 5);

    // 2. Group explorer files by package name
    const grouped: Record<string, FileAnalysis[]> = {};
    analysisData.fileAnalyses.forEach(file => {
      const pkg = file.packageName || '(default package)';
      if (!grouped[pkg]) {
        grouped[pkg] = [];
      }
      grouped[pkg].push(file);
    });

    this.packagesWithFiles = Object.keys(grouped).map(pkgName => ({
      name: pkgName,
      files: grouped[pkgName].sort((a, b) => this.getFileName(a.filePath).localeCompare(this.getFileName(b.filePath)))
    })).sort((a, b) => a.name.localeCompare(b.name));

    this.filteredPackages = [...this.packagesWithFiles];
    
    // Auto-expand first package
    if (this.packagesWithFiles.length > 0) {
      this.expandedPackages[this.packagesWithFiles[0].name] = true;
      // Auto-select first file if explorer opened
      if (this.packagesWithFiles[0].files.length > 0) {
        this.selectFile(this.packagesWithFiles[0].files[0]);
      }
    }
  }

  private loadReviewDetails(analysisId: string) {
    this.reviewLoading = true;
    this.projectService.getReviewByAnalysis(analysisId).subscribe({
      next: (reviewData) => {
        this.review = reviewData;
        this.reviewLoading = false;
      },
      error: () => {
        this.reviewLoading = false;
      }
    });
  }

  generateReview() {
    if (!this.analysis) return;
    this.reviewLoading = true;
    this.projectService.generateReview(this.analysis.id).subscribe({
      next: (reviewData) => {
        this.review = reviewData;
        this.reviewLoading = false;
      },
      error: () => {
        this.reviewLoading = false;
      }
    });
  }

  // Expansion panel icon mappings
  getSectionIcon(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('summary')) return 'assignment';
    if (t.includes('security')) return 'gpp_bad';
    if (t.includes('performance') || t.includes('speed')) return 'bolt';
    if (t.includes('architecture') || t.includes('design')) return 'dns';
    if (t.includes('maintainability') || t.includes('clean')) return 'engineering';
    if (t.includes('refactoring') || t.includes('suggestion')) return 'lightbulb';
    if (t.includes('testing')) return 'flaky';
    return 'article';
  }

  getSectionIconColor(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('summary')) return 'blue';
    if (t.includes('security')) return 'red';
    if (t.includes('performance') || t.includes('speed')) return 'yellow';
    if (t.includes('architecture') || t.includes('design')) return 'purple';
    if (t.includes('maintainability') || t.includes('clean')) return 'green';
    if (t.includes('refactoring') || t.includes('suggestion')) return 'yellow';
    return 'blue';
  }

  getExecutionTimeText(ms?: number): string {
    if (!ms) return 'N/A';
    return (ms / 1000).toFixed(1) + 's';
  }

  // File explorer helpers
  getFileName(filePath: string): string {
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1];
  }

  togglePackage(pkgName: string) {
    this.expandedPackages[pkgName] = !this.expandedPackages[pkgName];
  }

  selectFile(file: FileAnalysis) {
    this.selectedFile = file;
    this.codeLoading = true;
    this.highlightedCode = '';

    if (this.project) {
      this.projectService.getFileContent(this.project.id, file.filePath).subscribe({
        next: (content) => {
          // Syntax highlight code asynchronously
          const result = hljs.highlight(content, { language: 'java' });
          this.highlightedCode = result.value;
          this.codeLoading = false;
        },
        error: () => {
          this.highlightedCode = '// Failed to load file source code content.';
          this.codeLoading = false;
        }
      });
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const q = input.value.toLowerCase().trim();
    this.codeSearchQuery = q;

    if (!q) {
      this.filteredPackages = [...this.packagesWithFiles];
      return;
    }

    this.filteredPackages = this.packagesWithFiles.map(pkg => {
      const files = pkg.files.filter(f => this.getFileName(f.filePath).toLowerCase().includes(q));
      return {
        ...pkg,
        files
      };
    }).filter(pkg => pkg.files.length > 0);
  }

  // Tab navigation & chart rendering trigger
  onTabChange(index: number) {
    if (index === 3) {
      // Small timeout to allow the tab viewport to layout
      setTimeout(() => {
        this.renderCharts();
      }, 100);
    }
  }

  private renderCharts() {
    if (!this.analysis) return;

    // Destroy prior charts
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    // 1. Types Chart
    const typesCtx = document.getElementById('typesChart') as HTMLCanvasElement;
    if (typesCtx) {
      const chart = new Chart(typesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Classes', 'Interfaces', 'Enums', 'Records'],
          datasets: [{
            data: [
              this.analysis.totalClasses,
              this.analysis.totalInterfaces,
              this.analysis.totalEnums,
              this.analysis.totalRecords
            ],
            backgroundColor: ['#0969da', '#2ea043', '#8250df', '#d29922'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
      this.charts.push(chart);
    }

    // 2. Largest Files Chart
    const filesCtx = document.getElementById('filesChart') as HTMLCanvasElement;
    if (filesCtx && this.largestClasses.length > 0) {
      const chart = new Chart(filesCtx, {
        type: 'bar',
        data: {
          labels: this.largestClasses.map(c => c.typeName),
          datasets: [{
            label: 'Line Count',
            data: this.largestClasses.map(c => c.lineCount),
            backgroundColor: '#8250df',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      this.charts.push(chart);
    }

    // 3. Package distribution Chart
    const packageCtx = document.getElementById('packageChart') as HTMLCanvasElement;
    if (packageCtx && this.packagesWithFiles.length > 0) {
      const chart = new Chart(packageCtx, {
        type: 'bar',
        data: {
          labels: this.packagesWithFiles.map(p => {
            const parts = p.name.split('.');
            return parts.length > 2 ? parts.slice(-2).join('.') : p.name;
          }),
          datasets: [{
            label: 'Files Count',
            data: this.packagesWithFiles.map(p => p.files.length),
            backgroundColor: '#0969da',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
      this.charts.push(chart);
    }
  }
}
