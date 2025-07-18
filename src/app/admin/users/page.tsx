'use client';

import { UserManagement } from '@/components/admin/user-management';
import { SuperUserGuard } from '@/components/auth/super-user-guard';

export default function UsersManagementPage() {
  return (
    <SuperUserGuard>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os usuários do sistema.
            </p>
          </div>
          
          <UserManagement />
        </div>
      </div>
    </SuperUserGuard>
  );
}
