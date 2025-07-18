"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  Clock,
  Fingerprint,
  Loader2,
  Map,
  MapPin,
  Send,
  User,
  UserCog,
  UserSquare
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterQRCode } from "@/components/ui/register-qrcode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSystemConfig } from "@/hooks/use-realtime";
import { useToast } from "@/hooks/use-toast";
import { addAttendance } from "@/lib/actions";
import { attendanceSchema, type AttendanceFormValues } from "@/lib/schemas";

// Interface para configuração dos campos
interface FieldInfo {
  name: keyof AttendanceFormValues;
  label: string;
  icon: any;
  placeholder: string;
  options?: string[];
}

// Função para criar campos do formulário dinamicamente
const createFormFields = (config: any): FieldInfo[] => [
  { name: "fullName", label: "Nome e Sobrenome", icon: User, placeholder: "Digite o nome completo" },
  { name: "cpf", label: "CPF", icon: Fingerprint, placeholder: "Apenas números" },
  { 
    name: "reclassification", 
    label: "Reclassificação", 
    icon: UserCog, 
    placeholder: "Selecione", 
    options: config?.reclassificationOptions || ['Local', 'Setorial', 'Central', 'Casa de oração', 'Estadual', 'Regional']
  },
  { name: "pastorName", label: "Nome do Pastor", icon: UserSquare, placeholder: "Digite o nome do pastor" },
  { name: "cfoCourse", label: "Curso CFO", icon: UserSquare, placeholder: "Selecione", options: ["SIM", "NÃO"] },
  { 
    name: "region", 
    label: "Região", 
    icon: Map, 
    placeholder: "Digite a região"
  },
  { 
    name: "churchPosition", 
    label: "Cargo na Igreja", 
    icon: Building, 
    placeholder: "Selecione", 
    options: config?.churchPositionOptions || [
      'Conselheiro(a)',
      'Financeiro(a)', 
      'Secretário(a)',
      'Pastor',
      'Presbítero',
      'Diácono',
      'Dirigente 1',
      'Dirigente 2',
      'Dirigente 3',
      'Cooperador(a)',
      'Líder Reação',
      'Líder Simplifique', 
      'Líder Creative',
      'Líder Discipulus',
      'Líder Adore',
      'Auxiliar Expansão (a)',
      'Etda Professor(a)',
      'Coordenador Etda (a)',
      'Líder Galileu (a)',
      'Líder Adote uma alma (a)',
      'Regente',
      'Membro',
      'Outro'
    ]
  },
  // ...campo removido...
  { name: "city", label: "Cidade", icon: MapPin, placeholder: "Digite a cidade" },
  { 
    name: "shift", 
    label: "Turno", 
    icon: Clock, 
    placeholder: "Selecione", 
    options: config?.shiftOptions || ['Manhã', 'Tarde',]
  },
  // campo 'status' removido do formulário
] as const;

function AttendanceFormContent() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { config, loading } = useSystemConfig();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      pastorName: "",
      cfoCourse: "",
      city: "",
      reclassification: "",
      region: "",
      churchPosition: "",
      shift: "",
      status: "Presente",
    },
  });

  const formFields = createFormFields(config);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: AttendanceFormValues) {
    setIsSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const result = await addAttendance(values);
      if (result.success) {
        setSuccess("Cadastro realizado com sucesso!");
        form.reset();
      } else {
        setError(result.error || "Não foi possível registrar sua presença. Tente novamente.");
      }
    } catch (err) {
      setError("Ocorreu um problema ao se comunicar com o serviço. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Cadastro</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para registrar a presença.
          {config && (
            <span className="block text-xs text-muted-foreground mt-1">
              Última atualização das opções: {config.lastUpdated.toLocaleString('pt-BR')}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 text-green-700 font-bold text-lg text-center bg-green-100 border border-green-300 rounded p-2 shadow-sm">{success}</div>
        )}
        {error && (
          <div className="mb-4 text-red-700 font-bold text-lg text-center bg-red-100 border border-red-300 rounded p-2 shadow-sm">{error}</div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((fieldInfo) => (
                <FormField
                  key={fieldInfo.name}
                  control={form.control}
                  name={fieldInfo.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <fieldInfo.icon className="h-4 w-4 text-muted-foreground" />
                        {fieldInfo.label}
                      </FormLabel>
                      {fieldInfo.options ? (
                         <Select onValueChange={field.onChange} value={field.value ?? ""}>
                           <FormControl>
                             <SelectTrigger>
                               <SelectValue placeholder={fieldInfo.placeholder} />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             {fieldInfo.options.map((option: string) => (
                               <SelectItem key={option} value={option}>{option}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      ) : (
                        <FormControl>
                          <Input placeholder={fieldInfo.placeholder} {...field} />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex justify-end">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando
                    </>
                  ) : (
                    <>
                      Registrar <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function AttendanceFormPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <RegisterQRCode url="https://ipda.app.br/register/" />
          {/* <h1 className="text-2xl font-bold mt-2">Registrar Presença</h1>
          <p className="text-muted-foreground text-center text-sm max-w-md">Preencha os campos abaixo para registrar a presença.</p> */}
        </div>
        <AttendanceFormContent />
      </div>
    </main>
  );
}
