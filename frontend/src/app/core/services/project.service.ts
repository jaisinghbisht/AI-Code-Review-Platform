import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProjectInfo, ProjectAnalysis, ProjectReview } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  // Upload ZIP project with progress tracking
  uploadProject(file: File): Observable<HttpEvent<ProjectInfo>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', '/api/projects/upload', formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req) as Observable<HttpEvent<ProjectInfo>>;
  }

  // Get project by ID
  getProject(id: string): Observable<ProjectInfo> {
    return this.http.get<ProjectInfo>(`/api/projects/${id}`);
  }

  // Get source code content of a project file
  getFileContent(projectId: string, filePath: string): Observable<string> {
    return this.http.get(`/api/projects/${projectId}/file-content`, {
      params: { path: filePath },
      responseType: 'text'
    });
  }

  // List all uploaded projects
  getAllProjects(): Observable<ProjectInfo[]> {
    return this.http.get<ProjectInfo[]>('/api/projects');
  }

  // Trigger analysis for a project
  runAnalysis(projectId: string): Observable<{ analysisId: string }> {
    return this.http.post<{ analysisId: string }>(`/api/analysis/${projectId}`, {});
  }

  // Get analysis results
  getAnalysis(analysisId: string): Observable<ProjectAnalysis> {
    return this.http.get<ProjectAnalysis>(`/api/analysis/${analysisId}`);
  }

  // Get all analysis runs for a project
  getAnalysesByProject(projectId: string): Observable<ProjectAnalysis[]> {
    return this.http.get<ProjectAnalysis[]>(`/api/analysis/project/${projectId}`);
  }

  // Trigger AI review generation
  generateReview(analysisId: string): Observable<ProjectReview> {
    return this.http.post<ProjectReview>(`/api/reviews/${analysisId}`, {});
  }

  // Get an existing review by ID
  getReview(reviewId: string): Observable<ProjectReview> {
    return this.http.get<ProjectReview>(`/api/reviews/${reviewId}`);
  }

  // Get the AI review for a specific analysis
  getReviewByAnalysis(analysisId: string): Observable<ProjectReview> {
    return this.http.get<ProjectReview>(`/api/reviews/analysis/${analysisId}`);
  }
}
