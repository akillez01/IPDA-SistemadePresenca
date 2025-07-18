'use client';

// import { AuthGuard } from '@/components/auth/auth-guard';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Rotas públicas que não precisam do layout completo
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  return isPublicRoute ? (
    <div className="min-h-screen">
      {children}
    </div>
  ) : (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
