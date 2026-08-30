import { inject, Injectable } from '@angular/core';
import { QueryClient } from '@tanstack/angular-query-experimental';

@Injectable({
  providedIn: 'root',
})
export class QueryClientService {
  queryClient = new QueryClient();
}
