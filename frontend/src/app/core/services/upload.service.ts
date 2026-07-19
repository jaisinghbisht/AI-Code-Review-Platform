import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubmissionRequest, SubmissionResponse } from '../models/submission.model';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = '/api/submissions';

  submitCode(request: SubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(this.apiUrl, request);
  }
}
