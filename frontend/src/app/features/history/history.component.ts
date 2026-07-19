import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReviewService } from '../../core/services/review.service';
import { ReviewResponse } from '../../core/models/review.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, RouterLink
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Review History</h1>
        <p class="subtitle">Access and manage past code reviews.</p>
      </div>
      
      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search repositories, files, or tags...">
        </mat-form-field>
        <button mat-stroked-button class="filter-btn"><mat-icon>filter_list</mat-icon> Filter</button>
      </div>

      <mat-card class="main-card">
        <table mat-table [dataSource]="dataSource" class="history-table">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element" class="id-cell"> #{{element.id}} </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element" class="date-cell"> {{element.createdAt | date:'MMM d, y, h:mm a'}} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element">
              <span class="status-chip success"><mat-icon>check_circle</mat-icon> Completed</span>
            </td>
          </ng-container>
          
          <ng-container matColumnDef="model">
            <th mat-header-cell *matHeaderCellDef> Model </th>
            <td mat-cell *matCellDef="let element" class="model-cell"> qwen2.5-coder:7b </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Actions </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-stroked-button color="primary" [routerLink]="['/report', element.submissionId]">
                View Report
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>
        
        <div class="empty-state" *ngIf="dataSource.length === 0">
          <mat-icon>history</mat-icon>
          <p>No review history found.</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; h1 { margin: 0; font-size: 28px; font-weight: 600; } .subtitle { color: #8b949e; margin-top: 8px; } }
    .toolbar { display: flex; gap: 16px; margin-bottom: 16px; align-items: center; }
    .search-field { flex: 1; }
    .filter-btn { height: 48px; }
    .main-card { background-color: #161b22; border: 1px solid #30363d; box-shadow: none; border-radius: 8px; overflow: hidden; padding: 0; }
    .history-table { width: 100%; background: transparent; }
    .table-row:hover { background-color: #1c2128; }
    th.mat-header-cell { color: #8b949e; font-weight: 600; border-bottom: 1px solid #30363d; padding: 16px; }
    td.mat-cell { color: #c9d1d9; border-bottom: 1px solid #30363d; padding: 16px; }
    .id-cell { font-family: monospace; color: #8b949e !important; }
    .date-cell { color: #8b949e !important; }
    .model-cell { font-size: 13px; color: #8b949e !important; }
    .status-chip { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; border: 1px solid transparent; mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; } }
    .status-chip.success { color: #3fb950; border-color: rgba(46, 160, 67, 0.4); background-color: rgba(46, 160, 67, 0.1); }
    .text-right { text-align: right; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 0; color: #8b949e; mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; } }
  `]
})
export class HistoryComponent implements OnInit {
  private reviewService = inject(ReviewService);
  
  displayedColumns: string[] = ['id', 'date', 'status', 'model', 'actions'];
  dataSource: ReviewResponse[] = [];

  ngOnInit() {
    this.reviewService.getHistory().subscribe({
      next: (data) => {
        this.dataSource = data || [];
      },
      error: () => {
        // Fallback or handle error
      }
    });
  }
}
