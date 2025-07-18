"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttendanceRecords } from "@/lib/actions";
import type { AttendanceRecord } from "@/lib/types";
import { useEffect, useState } from "react";

export default function PresencaCadastradosPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const data = await getAttendanceRecords();
        if (Array.isArray(data) && data.length > 0) {
          setRecords(data);
        } else {
          // Dados de exemplo para demonstração
          setRecords([
            {
              id: 'demo1',
              fullName: 'João da Silva',
              cpf: '123.456.789-00',
              reclassification: 'Local',
              pastorName: 'Pr. Carlos',
              region: 'Norte',
              churchPosition: 'Presbítero',
              city: 'São Paulo',
              shift: 'Manhã',
              status: 'Presente',
              timestamp: new Date(),
            },
            {
              id: 'demo2',
              fullName: 'Maria Oliveira',
              cpf: '987.654.321-00',
              reclassification: 'Central',
              pastorName: 'Pr. José',
              region: 'Sul',
              churchPosition: 'Secretário(a)',
              city: 'Campinas',
              shift: 'Tarde',
              status: 'Presente',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        setError("Erro ao carregar registros de presença.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  function handleExport() {
    const headers = [
      'Nome Completo',
      'Região',
      'Cargo na Igreja',
      'Nome do Pastor',
      'Data/Hora'
    ];
    const csvContent = [
      headers.join(','),
      ...records.map(r => [
        `"${r.fullName}"`,
        r.region || '',
        r.churchPosition || '',
        `"${r.pastorName}"`,
        r.timestamp ? r.timestamp.toLocaleDateString('pt-BR') + ' ' + r.timestamp.toLocaleTimeString('pt-BR') : ''
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-presenca-cadastrados-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Presença de Cadastrados</CardTitle>
        <CardDescription>
          Visualize e exporte as presenças dos cadastrados com Nome, Região, Cargo, Nome do Pastor e Data/Hora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} className="mb-4">Baixar Relatório de Presença</Button>
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          records.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum registro de presença encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Nome</th>
                    <th className="p-2 border">Região</th>
                    <th className="p-2 border">Cargo</th>
                    <th className="p-2 border">Nome do Pastor</th>
                    <th className="p-2 border">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 border">{r.fullName}</td>
                      <td className="p-2 border">{r.region}</td>
                      <td className="p-2 border">{r.churchPosition}</td>
                      <td className="p-2 border">{r.pastorName}</td>
                      <td className="p-2 border">{r.timestamp ? r.timestamp.toLocaleString('pt-BR') : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
