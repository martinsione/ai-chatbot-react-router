// import { cookies } from 'next/headers';
import type { Route } from 'types:(chat)/+types.layout';
import { LoaderFunctionArgs, Outlet } from 'react-router';

import { AppSidebar } from '@/components/custom/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { auth } from '../(auth)/auth';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth(request);

  return { session };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  // const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  // const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <SidebarProvider /*defaultOpen={!isCollapsed}*/>
      <AppSidebar user={loaderData.session?.user} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
