'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { refreshToken } from '@/lib/api/auth.api';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { InstallBanner } from '@/components/shared/install-banner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function getRoleHomePath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/platform';
    case 'COLLECTOR':
      return '/today';
    default:
      return '/dashboard';
  }
}

function isRouteAllowedForRole(pathname: string, role: string): boolean {
  const adminPaths = ['/dashboard', '/loans', '/customers', '/money', '/more', '/today'];
  const collectorPaths = ['/today', '/loans', '/customers', '/profile'];
  const platformPaths = ['/platform'];
  const sharedPaths = ['/shared'];

  if (sharedPaths.some((p) => pathname.startsWith(p))) return true;

  switch (role) {
    case 'ADMIN':
      return adminPaths.some((p) => pathname.startsWith(p));
    case 'COLLECTOR':
      return collectorPaths.some((p) => pathname.startsWith(p));
    case 'SUPER_ADMIN':
      return platformPaths.some((p) => pathname.startsWith(p));
    default:
      return false;
  }
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(expiresIn: number) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const refreshAt = expiresIn * 0.8 * 1000;
  refreshTimer = setTimeout(async () => {
    const store = useAuthStore.getState();
    if (!store.refreshToken) return;
    try {
      const data = await refreshToken(store.refreshToken);
      store.setTokens(data.accessToken, data.refreshToken, data.expiresIn);
      scheduleRefresh(data.expiresIn);
    } catch {
      store.clearAuth();
      window.location.href = '/login';
    }
  }, refreshAt);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshToken: storedRefreshToken, isHydrated, clearAuth, setTokens } =
    useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);
  const bootstrapRan = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (bootstrapRan.current) return;
    bootstrapRan.current = true;

    async function bootstrap() {
      const store = useAuthStore.getState();

      if (!store.refreshToken) {
        router.replace('/login');
        return;
      }

      // If we already have a valid access token (e.g. just logged in),
      // skip the refresh and just schedule the next proactive refresh.
      if (store.accessToken && store.expiresAt && store.expiresAt > Date.now()) {
        const remainingSec = (store.expiresAt - Date.now()) / 1000;
        scheduleRefresh(remainingSec);
        setIsBootstrapping(false);
        return;
      }

      try {
        const data = await refreshToken(store.refreshToken);
        setTokens(data.accessToken, data.refreshToken, data.expiresIn);
        scheduleRefresh(data.expiresIn);
      } catch (err: unknown) {
        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err as { status: number }).status
            : 0;
        if (status === 403) {
          setIsSuspended(true);
        } else {
          clearAuth();
          router.replace('/login');
          return;
        }
      }

      setIsBootstrapping(false);
    }

    bootstrap();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  useEffect(() => {
    if (isBootstrapping || !user) return;

    if (!isRouteAllowedForRole(pathname, user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [pathname, user, isBootstrapping, router]);

  if (!isHydrated || isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold text-destructive">Tenant Suspended</h1>
          <p className="text-muted-foreground">
            Your organization&apos;s account has been suspended. Please contact the platform
            administrator for assistance.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              clearAuth();
              router.replace('/login');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <OfflineBanner />
      {children}
      <InstallBanner />
    </>
  );
}
