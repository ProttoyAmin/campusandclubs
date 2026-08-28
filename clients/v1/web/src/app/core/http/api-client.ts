import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(url: string) {
    return this.http.get<T>(url, {
      withCredentials: true,
    });
  }
  post<T>(url: string, body?: unknown) {
    console.log('Posting to', url, 'body', body);
    return this.http.post<T>(url, body, {
      withCredentials: true,
    });
  }

  put<T>(url: string, body?: unknown) {
    return this.http.put<T>(url, body, {
      withCredentials: true,
    });
  }

  patch<T>(url: string, body?: unknown) {
    return this.http.patch<T>(url, body, {
      withCredentials: true,
    });
  }

  delete<T>(url: string) {
    return this.http.delete<T>(url, {
      withCredentials: true,
    });
  }
}
