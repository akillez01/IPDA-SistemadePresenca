'use client';

import { SynchronizedAnalytics } from '@/components/analytics/synchronized-analytics';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRealtimeAttendance } from '@/hooks/use-realtime';
import type { AttendanceRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertCircle, BarChart, Loader2, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

function DashboardContent() {
  const { stats, todayRecords, loading, error } = useRealtimeAttendance();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(todayRecords.length / pageSize);
  const paginatedRecords = todayRecords.slice((page - 1) * pageSize, page * pageSize);

  const getStatusVariant = (
    status: AttendanceRecord['status']
  ): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Presente':
        return 'default';
      case 'Justificado':
        return 'secondary';
      case 'Ausente':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const statusBgClass = {
    Presente: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    Justificado: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    Ausente: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Verifique sua conexão com o Firebase.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes Hoje</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              Participantes presentes hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Justificados</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.justified}</div>
            <p className="text-xs text-muted-foreground">
              Participantes justificados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">
              Participantes ausentes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de presença hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sincronizados */}
      <SynchronizedAnalytics />

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Hoje</CardTitle>
          <CardDescription>
            Lista das presenças registradas hoje no sistema ({todayRecords.length} registros).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de presença encontrado para hoje.</p>
              <p className="text-sm">Registros aparecerão aqui quando adicionados ao Firebase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Exibindo {paginatedRecords.length} de {todayRecords.length} registros
                {totalPages > 1 && (
                  <div className="mt-2 flex gap-2 items-center justify-center">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>&lt; Anterior</Button>
                    <span className="text-xs">Página {page} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Próxima &gt;</Button>
                  </div>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead className="hidden md:table-cell">Cargo</TableHead>
                    <TableHead className="hidden lg:table-cell">Região</TableHead>
                    <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                    <TableHead className="hidden md:table-cell">Turno</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record: AttendanceRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {record.churchPosition}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.region}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.city}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.shift}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-transparent', statusBgClass[record.status])}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
