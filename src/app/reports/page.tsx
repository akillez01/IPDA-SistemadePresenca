"use client"

import { DateRangePicker } from "@/components/date-range-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useRealtimeReports } from "@/hooks/use-reports"
import { exportReportSummaryToCSV, exportToCSV, printReport } from "@/lib/export-utils"
import { CheckCircle, Clock, Download, FileText, Printer, RefreshCw, Users, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

export default function ReportsPage() {
  const { reportData, weeklyStats, loading, error, refreshData, lastUpdate, fetchDateRangeData } = useRealtimeReports();
  const [isFilterActive, setIsFilterActive] = React.useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // DEBUG: Verificar estados principais
  console.log('DEBUG reportData:', reportData);
  console.log('DEBUG loading:', loading);
  console.log('DEBUG error:', error);
  console.log('DEBUG user:', user);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleDateRangeChange = async (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
      setIsFilterActive(true);
      await fetchDateRangeData(startDate, endDate);
    } else {
      setIsFilterActive(false);
      refreshData(); // Voltar para todos os dados
    }
  };

  const handleExportCSV = () => {
    if (reportData?.records) {
      exportToCSV(reportData.records, 'relatorio-presenca-detalhado');
    }
  };

  const handleExportSummary = () => {
    if (reportData) {
      exportReportSummaryToCSV(
        reportData.summary,
        reportData.byShift,
        reportData.byRegion,
        reportData.byPosition,
        'resumo-relatorio-presenca'
      );
    }
  };

  const handlePrint = () => {
    printReport(reportData);
  };

  // Dados para gráfico de presença por turno
  const attendanceByShift = React.useMemo(() => {
    if (!reportData) return [];
    
    return [
      { shift: "Manhã", total: reportData.byShift.Manhã, fill: "hsl(var(--chart-1))" },
      { shift: "Tarde", total: reportData.byShift.Tarde, fill: "hsl(var(--chart-2))" },
      { shift: "Noite", total: reportData.byShift.Noite, fill: "hsl(var(--chart-3))" },
    ];
  }, [reportData]);

  // Dados para gráfico de presença por região
  const attendanceByRegion = React.useMemo(() => {
    if (!reportData) return [];
    
    return Object.entries(reportData.byRegion).map(([region, count], index) => ({
      region,
      total: count,
      fill: `hsl(var(--chart-${index + 1}))`
    }));
  }, [reportData]);

  // Dados para gráfico de status geral
  const statusData = React.useMemo(() => {
    if (!reportData) return [];
    
    return [
      { status: "Presente", total: reportData.summary.present, fill: "#22c55e" },
      { status: "Justificado", total: reportData.summary.justified, fill: "#eab308" },
      { status: "Ausente", total: reportData.summary.absent, fill: "#ef4444" },
    ];
  }, [reportData]);

  // Dados por cargo na igreja
  const attendanceByPosition = React.useMemo(() => {
    if (!reportData) return [];
    // Ordena e pega os 10 cargos mais presentes
    return Object.entries(reportData.byPosition)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([position, count], index) => ({
        position,
        total: count,
        fill: `hsl(var(--chart-${index + 1}))`
      }));
  }, [reportData]);

  const chartConfig = {
    total: {
      label: "Total",
    },
    morning: {
      label: "Manhã",
      color: "hsl(var(--chart-1))",
    },
    afternoon: {
      label: "Tarde",
      color: "hsl(var(--chart-2))",
    },
    night: {
      label: "Noite",
      color: "hsl(var(--chart-3))",
    },
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Presença</CardTitle>
            <CardDescription>Carregando dados em tempo real...</CardDescription>
          </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios de Presença</CardTitle>
            <CardDescription>Erro ao carregar dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. Tente atualizar a página ou verifique sua conexão.
              </AlertDescription>
            </Alert>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header com estatísticas e controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Relatórios de Presença
                {isFilterActive && (
                  <Badge variant="secondary" className="ml-2">
                    Filtrado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Análise visual dos dados de presença em tempo real - {reportData?.summary.total || 0} registros carregados
                <br />
                <span className="text-xs text-muted-foreground">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </span>
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <DateRangePicker 
                onDateRangeChange={handleDateRangeChange}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={refreshData} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!reportData}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileText className="mr-2 h-4 w-4" />
                      Dados Detalhados (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportSummary}>
                      <FileText className="mr-2 h-4 w-4" />
                      Resumo (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir Relatório
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Presentes</p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData?.summary.present || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Justificados</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reportData?.summary.justified || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ausentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {reportData?.summary.absent || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{reportData?.summary.total || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de presença por turno */}
        <Card>
          <CardHeader>
            <CardTitle>Presença por Turno</CardTitle>
            <CardDescription>
              Distribuição de presenças nos diferentes turnos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={attendanceByShift}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="shift"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="total" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Card de presença por região removido conforme solicitado */}

        {/* Gráfico de status geral (Pizza) */}
        <Card>
          <CardHeader>
            <CardTitle>Status Geral</CardTitle>
            <CardDescription>
              Distribuição geral dos status de presença
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="total"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, total }) => `${status}: ${total}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de presença por cargo */}
        <Card>
          <CardHeader>
            <CardTitle>Presença por Cargo</CardTitle>
            <CardDescription>
              Distribuição de presenças por cargo na igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={attendanceByPosition}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="position"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="total" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de tendência semanal */}
        {weeklyStats.length > 0 && !isFilterActive && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tendência Semanal</CardTitle>
              <CardDescription>
                Evolução da presença nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={weeklyStats}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                      formatter={(value, name) => [
                        `${value} ${name === 'present' ? 'presentes' : name === 'total' ? 'total' : 'taxa'}`,
                        name === 'present' ? 'Presentes' : name === 'total' ? 'Total' : 'Taxa (%)'
                      ]}
                    />}
                  />
                  <Bar dataKey="present" fill="hsl(var(--chart-1))" radius={4} />
                  <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Detalhadas</CardTitle>
          <CardDescription>
            Estatísticas adicionais baseadas nos dados em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Taxa de Presença Geral</h4>
              <div className="text-2xl font-bold text-green-600">
                {reportData?.summary.attendanceRate || 0}%
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Turno Mais Popular</h4>
              <div className="text-lg font-semibold">
                {attendanceByShift.reduce((max, shift) => shift.total > max.total ? shift : max, { shift: '-', total: 0 }).shift}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Região Mais Ativa</h4>
              <div className="text-lg font-semibold">
                {attendanceByRegion.reduce((max, region) => region.total > max.total ? region : max, { region: '-', total: 0 }).region}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
