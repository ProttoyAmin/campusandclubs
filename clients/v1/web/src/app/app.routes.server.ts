import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '@/auth/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '@/:username/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '@/settings/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
