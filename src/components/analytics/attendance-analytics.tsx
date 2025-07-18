'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRealtimeAttendance } from '@/hooks/use-realtime';
import { BarChart3, Building, Clock, Users2 } from 'lucide-react';

export function AttendanceAnalytics() {
  const { stats, loading, error } = useRealtimeAttendance();

  if (loading || error || !stats) {
    return null;
  }

  const topPositions = Object.entries(stats.byPosition)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  const topReclassifications = Object.entries(stats.byReclassification)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Análise por Turno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Distribuição por Turno
          </CardTitle>
          <CardDescription>
            Presença distribuída pelos turnos do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Manhã</span>
              <Badge variant="outline">{stats.byShift.morning}</Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.byShift.morning / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tarde</span>
              <Badge variant="outline">{stats.byShift.afternoon}</Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.byShift.afternoon / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Noite</span>
              <Badge variant="outline">{stats.byShift.night}</Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.byShift.night / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>


      {/* Top Cargos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Cargos Mais Presentes
          </CardTitle>
          <CardDescription>
            Top 5 cargos com mais presença hoje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPositions.length > 0 ? (
            topPositions.map(([position, count]) => (
              <div key={position} className="flex justify-between items-center">
                <span className="text-sm font-medium truncate">{position}</span>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum registro ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Análise de Presença */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Status de Presença
          </CardTitle>
          <CardDescription>
            Distribuição do status de presença
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Presentes</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stats.present}
              </Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.present / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-600">Justificados</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {stats.justified}
              </Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.justified / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-600">Ausentes</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {stats.absent}
              </Badge>
            </div>
            <Progress 
              value={stats.total > 0 ? (stats.absent / stats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Reclassificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Por Reclassificação
          </CardTitle>
          <CardDescription>
            Distribuição por tipo de igreja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topReclassifications.length > 0 ? (
            topReclassifications.map(([reclassification, count]) => (
              <div key={reclassification} className="flex justify-between items-center">
                <span className="text-sm font-medium">{reclassification}</span>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum registro ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumo Geral
          </CardTitle>
          <CardDescription>
            Estatísticas gerais do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.attendanceRate}%</div>
            <p className="text-sm text-muted-foreground">Taxa de Presença</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">Presentes</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">{stats.justified}</div>
              <p className="text-xs text-muted-foreground">Justificados</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">Ausentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
