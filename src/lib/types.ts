export type AttendanceRecord = {
  id: string;
  timestamp: Date;
  fullName: string;
  cpf: string;
  reclassification: string;
  pastorName: string;
  region: string;
  churchPosition: string;
  city: string;
  shift: string;
  status: string;
  createdBy?: string; // ID do usuário que criou o registro
  createdAt?: Date; // Data de criação
};

// Configurações globais do sistema
export type SystemConfig = {
  reclassificationOptions: string[];
  regionOptions: string[];
  churchPositionOptions: string[];
  shiftOptions: string[];
  statusOptions: string[];
  lastUpdated: Date;
  updatedBy: string;
};
