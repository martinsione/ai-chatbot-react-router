import type { LinksFunction, MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';

import './globals.css';

export const meta: MetaFunction = () => [
  {
    title: 'React Router Chatbot Template',
  },
  {
    name: 'description',
    content: 'React Router chatbot template using the AI SDK.',
  },
];

const loadFont = (href: string) =>
  ({
    rel: 'preload',
    href,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  }) as const;

export const links: LinksFunction = () => [
  loadFont('/fonts/geist.woff2'),
  loadFont('/fonts/geist-mono.woff2'),
];

export default function App() {
  return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        {children}
        <Toaster position="top-center" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
