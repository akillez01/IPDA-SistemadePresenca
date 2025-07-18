// Exportação explícita para uso no client
export { getAllPresencas };
// Firebase: relatório de presença (exemplo básico)
export async function getAttendanceReportData(start?: Date, end?: Date) {
  if (start && end) {
    return await getPresencasByDateRange(start, end);
  }
  // Busca todos os dados se não houver filtro
  const records = await getPresencas();
  // Processa os dados para o formato ReportData
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === 'Presente').length;
  const justifiedCount = records.filter(r => r.status === 'Justificado').length;
  const absentCount = records.filter(r => r.status === 'Ausente').length;
  const byShift = {
    Manhã: records.filter(r => r.shift === 'Manhã' && r.status === 'Presente').length,
    Tarde: records.filter(r => r.shift === 'Tarde' && r.status === 'Presente').length,
    Noite: records.filter(r => r.shift === 'Noite' && r.status === 'Presente').length,
  };
  const byRegion: Record<string, number> = {};
  records.forEach(r => {
    if (r.region && r.status === 'Presente') {
      byRegion[r.region] = (byRegion[r.region] || 0) + 1;
    }
  });
  const byPosition: Record<string, number> = {};
  records.forEach(r => {
    if (r.churchPosition && r.status === 'Presente') {
      byPosition[r.churchPosition] = (byPosition[r.churchPosition] || 0) + 1;
    }
  });

  // Top 10 cargos com mais presença
  const topPositions = Object.entries(byPosition)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cargo, count]) => ({ cargo, count }));
  const byReclassification: Record<string, number> = {};
  records.forEach(r => {
    if (r.reclassification && r.status === 'Presente') {
      byReclassification[r.reclassification] = (byReclassification[r.reclassification] || 0) + 1;
    }
  });
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;
  // Converter Presenca para AttendanceRecord (adiciona timestamp)
  // Retorna os registros originais do Firestore, sem conversão extra
  const attendanceRecords = records;
  return {
    summary: {
      total: totalRecords,
      present: presentCount,
      justified: justifiedCount,
      absent: absentCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    },
    byShift,
    byRegion,
    byPosition,
    byReclassification,
    records: attendanceRecords
  };
}

// Firebase: estatísticas semanais (exemplo básico)
export async function getWeeklyAttendanceStats() {
  // Busca os últimos 7 dias
  const today = new Date();
  today.setHours(0,0,0,0);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  const presencas = await getPresencasByDateRange(weekAgo, today);
  // Agrupa por dia
  const stats: Record<string, number> = {};
  presencas.forEach((p: any) => {
    const d = p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().toISOString().slice(0,10) : '';
    if (d) stats[d] = (stats[d] || 0) + 1;
  });
  return stats;
}
// Firebase: consulta por intervalo de datas
export async function getAttendanceByDateRange(start: Date, end: Date) {
  return await getPresencasByDateRange(start, end);
}

import {
  addPresenca,
  getAllPresencas,
  getPresencaByCpf,
  getPresencas,
  getPresencasByDateRange,
  getPresencaStats
} from "./presenca-mysql";
import type { AttendanceFormValues } from "./schemas";

export async function addAttendance(data: AttendanceFormValues) {
  try {
    // Impedir duplicidade de CPF para todo o tempo
    const cleanCpf = (data.cpf || '').replace(/\D/g, '');
    const existing = await getPresencaByCpf(cleanCpf);
    if (existing) {
      return { success: false, error: "Já existe um registro para este CPF. Não é possível cadastrar novamente." };
    }
    // Insere no MariaDB (Plesk)
    await addPresenca({
      ...data,
      cpf: cleanCpf,
      status: "Presente"
    });
    return { success: true };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: "Falha ao registrar presença. Verifique as configurações do banco de dados." };
  }
}

// Firebase: consulta todos os registros
export async function getAttendanceRecords() {
  return await getPresencas();
}


// Firebase: consulta estatísticas
export async function getAttendanceStats() {
  return await getPresencaStats();
}

// Firebase: consulta registros do dia
export async function getTodayAttendance() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return await getPresencasByDateRange(today, tomorrow);
}
