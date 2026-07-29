import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
// Side-effect: creates the Authentication singleton which wires up
// the API client's token getter and 401 refresh handler.
import '@/features/auth/services/authentication';
import App from './App.tsx';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client.ts';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
