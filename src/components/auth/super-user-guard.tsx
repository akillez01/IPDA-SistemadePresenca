'use client';

import { useAuth } from '@/hooks/use-auth';
import { isSuperUser } from '@/lib/auth';
import { ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SuperUserGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function SuperUserGuard({ children, fallbackUrl = '/' }: SuperUserGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isSuperUser(user.email || '')) {
      if (fallbackUrl) {
        router.push(fallbackUrl);
      }
    }
  }, [user, loading, router, fallbackUrl]);

  // Loading state
  if (loading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ShieldX className="h-5 w-5" />
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Você precisa estar logado para acessar esta página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Not a super user
  if (!isSuperUser(user.email || '')) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ShieldX className="h-5 w-5" />
            Acesso Restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Esta área é restrita apenas para super usuários.
              <br />
              <strong>Seu perfil:</strong> Usuário Padrão
              <br />
              <strong>Email:</strong> {user.email}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Super user - show content
  return <>{children}</>;
}
