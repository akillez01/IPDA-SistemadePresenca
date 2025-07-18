"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceRecords } from "@/lib/actions";
import type { AttendanceRecord } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PresencaCadastradosPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
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
    if (user) fetchRecords();
  }, [user, authLoading, router]);

  function handleExport() {
    const headers = [
      'Nome Completo',
      'CPF',
      'Região',
      'Cargo na Igreja',
      'Nome do Pastor',
      'Data/Hora'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r => [
        `"${r.fullName}"`,
        `"${r.cpf}"`,
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

  // Filtrar registros por nome ou CPF
  const filteredRecords = records.filter(r => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return r.fullName.toLowerCase().includes(term) || r.cpf.toLowerCase().includes(term);
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Presença de Cadastrados</CardTitle>
        <CardDescription>
          Visualize e exporte as presenças dos cadastrados com Nome, CPF, Região, Cargo, Nome do Pastor e Data/Hora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm w-full md:w-64"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button onClick={handleExport}>Baixar Relatório de Presença</Button>
        </div>
        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          filteredRecords.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum registro de presença encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Nome</th>
                    <th className="p-2 border">CPF</th>
                    <th className="p-2 border">Região</th>
                    <th className="p-2 border">Cargo</th>
                    <th className="p-2 border">Nome do Pastor</th>
                    <th className="p-2 border">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 border">{r.fullName}</td>
                      <td className="p-2 border">{r.cpf}</td>
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
