import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewResponse } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reviews';

  generateReview(submissionId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${submissionId}`, {});
  }

  getReview(submissionId: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}/${submissionId}`);
  }

  getHistory(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/history`);
  }
}
