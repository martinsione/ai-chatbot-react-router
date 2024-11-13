import type { RouteConfig } from '@react-router/dev/routes';
import { layout, route } from '@react-router/dev/routes';

export const routes: RouteConfig = [
  // API routes
  route('/api/auth/*', './(auth)/api/auth/[...nextauth]/route.ts'),
  route('/api/history', './(chat)/api/history/route.ts'),
  route('/api/suggestions', './(chat)/api/suggestions/route.ts'),
  route('/api/vote', './(chat)/api/vote/route.ts'),
  route('/api/chat', './(chat)/api/chat/route.ts'),
  route('/api/document', './(chat)/api/document/route.ts'),
  route('/api/files/upload', './(chat)/api/files/upload/route.ts'),

  // UI
  layout('./(chat)/layout.tsx', [
    //
    route('/', './(chat)/page.tsx', { id: 'chat' }),
    route('/chat/:id', './(chat)/page.tsx', { id: 'chat/:id' }),
  ]),

  // Auth
  route('/register', './(auth)/register/page.tsx'),
  route('/login', './(auth)/login/page.tsx'),
];
