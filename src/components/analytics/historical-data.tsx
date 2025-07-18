'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeAttendance } from '@/hooks/use-realtime';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';

export function HistoricalData() {
  const { attendanceRecords, loading, error } = useRealtimeAttendance();

  const historicalStats = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        last7Days: [],
        totalWeek: 0,
        averageDaily: 0,
        trend: 'stable' as 'up' | 'down' | 'stable'
      };
    }

    // Calcular dados dos últimos 7 dias
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= date && recordDate < nextDay;
      });
      
      last7Days.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        total: dayRecords.length,
        present: dayRecords.filter(r => r.status === 'Presente').length,
        absent: dayRecords.filter(r => r.status === 'Ausente').length,
        justified: dayRecords.filter(r => r.status === 'Justificado').length,
        rate: dayRecords.length > 0 ? Math.round((dayRecords.filter(r => r.status === 'Presente').length / dayRecords.length) * 100) : 0
      });
    }

    const totalWeek = last7Days.reduce((sum, day) => sum + day.total, 0);
    const averageDaily = Math.round(totalWeek / 7);
    
    // Calcular tendência (comparando primeiros 3 dias com últimos 3 dias)
    const firstHalf = last7Days.slice(0, 3).reduce((sum, day) => sum + day.total, 0) / 3;
    const secondHalf = last7Days.slice(-3).reduce((sum, day) => sum + day.total, 0) / 3;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalf > firstHalf * 1.1) trend = 'up';
    else if (secondHalf < firstHalf * 0.9) trend = 'down';

    return {
      last7Days,
      totalWeek,
      averageDaily,
      trend
    };
  }, [attendanceRecords]);

  if (loading || error) {
    return null;
  }

  const getTrendIcon = () => {
    switch (historicalStats.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (historicalStats.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dados Históricos</h2>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {historicalStats.trend === 'up' ? 'Crescendo' : 
             historicalStats.trend === 'down' ? 'Decrescendo' : 'Estável'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Resumo da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Resumo Semanal
            </CardTitle>
            <CardDescription>
              Estatísticas dos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total da semana:</span>
              <Badge variant="secondary">{historicalStats.totalWeek}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Média diária:</span>
              <Badge variant="outline">{historicalStats.averageDaily}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tendência:</span>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={`text-sm ${getTrendColor()}`}>
                  {historicalStats.trend === 'up' ? 'Crescimento' : 
                   historicalStats.trend === 'down' ? 'Queda' : 'Estável'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Últimos 7 Dias - Tabela */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Últimos 7 Dias
            </CardTitle>
            <CardDescription>
              Detalhamento diário das presenças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historicalStats.last7Days.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[80px]">{day.date}</div>
                    <Badge variant="outline" className="min-w-[60px] justify-center">
                      {day.total} total
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {day.present} presentes
                    </Badge>
                    {day.justified > 0 && (
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {day.justified} justificados
                      </Badge>
                    )}
                    {day.absent > 0 && (
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                        {day.absent} ausentes
                      </Badge>
                    )}
                    <div className="text-sm font-medium text-primary ml-2">
                      {day.rate}%
                    </div>
                  </div>
                </div>
              ))}
              
              {historicalStats.last7Days.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado histórico encontrado</p>
                  <p className="text-sm">Dados aparecerão conforme registros são adicionados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
