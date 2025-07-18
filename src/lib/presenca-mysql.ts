import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "./firebase";

export type Presenca = {
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
  createdAt?: Date;
};

export async function getPresencas(): Promise<Presenca[]> {
  const snapshot = await getDocs(collection(db, "attendance"));
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    let createdAt: Date = new Date();
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt;
      } else if (typeof data.createdAt === "number") {
        createdAt = new Date(data.createdAt);
      } else if (typeof data.createdAt === "string") {
        const d = new Date(data.createdAt);
        if (!isNaN(d.getTime())) createdAt = d;
      }
    }
    return {
      id: doc.id,
      timestamp: createdAt,
      fullName: data.fullName ?? "",
      cpf: data.cpf ?? "",
      reclassification: data.reclassification ?? "",
      pastorName: data.pastorName ?? "",
      region: data.region ?? "",
      churchPosition: data.churchPosition ?? "",
      city: data.city ?? "",
      shift: data.shift ?? "",
      status: data.status ?? "",
      createdAt,
    };
  });
}

export async function addPresenca(data: Presenca) {
  const { addDoc } = await import("firebase/firestore");
  const docRef = await addDoc(collection(db, "attendance"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAttendance(): Promise<Presenca[]> {
  const snapshot = await getDocs(collection(db, "attendance"));
  return snapshot.docs
    .map((doc: any) => {
      const data = doc.data();
      let createdAt: Date | undefined = undefined;
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === "function") {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt;
        } else if (typeof data.createdAt === "number") {
          createdAt = new Date(data.createdAt);
        }
      }
      return {
        id: doc.id,
        fullName: data.fullName ?? "",
        cpf: data.cpf ?? "",
        reclassification: data.reclassification ?? "",
        pastorName: data.pastorName ?? "",
        region: data.region ?? "",
        churchPosition: data.churchPosition ?? "",
        city: data.city ?? "",
        shift: data.shift ?? "",
        status: data.status ?? "",
        createdAt,
      } as Presenca;
    })
    .filter((p: Presenca) => p.createdAt && p.createdAt instanceof Date);
}

export async function getPresencaByCpf(cpf: string): Promise<Presenca | null> {
  const q = query(collection(db, "attendance"), where("cpf", "==", cpf));
  const snapshot = await getDocs(q);
  if (snapshot.docs.length > 0) {
    const doc = snapshot.docs[0];
    const data = doc.data();
    let createdAt: Date | undefined = undefined;
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt;
      } else if (typeof data.createdAt === "number") {
        createdAt = new Date(data.createdAt);
      }
    }
    return {
      id: doc.id,
      fullName: data.fullName ?? "",
      cpf: data.cpf ?? "",
      reclassification: data.reclassification ?? "",
      pastorName: data.pastorName ?? "",
      region: data.region ?? "",
      churchPosition: data.churchPosition ?? "",
      city: data.city ?? "",
      shift: data.shift ?? "",
      status: data.status ?? "",
      createdAt,
    } as Presenca;
  }
  return null;
}

export async function getAllPresencas(): Promise<Presenca[]> {
  const snapshot = await getDocs(collection(db, "attendance"));
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    let createdAt: Date = new Date();
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt;
      } else if (typeof data.createdAt === "number") {
        createdAt = new Date(data.createdAt);
      } else if (typeof data.createdAt === "string") {
        const d = new Date(data.createdAt);
        if (!isNaN(d.getTime())) createdAt = d;
      }
    }
    return {
      id: doc.id,
      timestamp: createdAt,
      fullName: data.fullName ?? "",
      cpf: data.cpf ?? "",
      reclassification: data.reclassification ?? "",
      pastorName: data.pastorName ?? "",
      region: data.region ?? "",
      churchPosition: data.churchPosition ?? "",
      city: data.city ?? "",
      shift: data.shift ?? "",
      status: data.status ?? "",
      createdAt,
    };
  });
}

export async function getPresencasByDateRange(start: Date, end: Date): Promise<Presenca[]> {
  const q = query(
    collection(db, "attendance"),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end))
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc: any) => {
      const data = doc.data();
      let createdAt: Date = new Date();
      if (data.createdAt) {
        try {
          if (typeof data.createdAt.toDate === "function") {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else if (typeof data.createdAt === "number") {
            createdAt = new Date(data.createdAt);
          } else if (typeof data.createdAt === "string") {
            const d = new Date(data.createdAt);
            if (!isNaN(d.getTime())) createdAt = d;
          }
        } catch (e) {
          createdAt = new Date();
        }
      }
      return {
        id: doc.id,
        timestamp: createdAt,
        fullName: data.fullName ?? "",
        cpf: data.cpf ?? "",
        reclassification: data.reclassification ?? "",
        pastorName: data.pastorName ?? "",
        region: data.region ?? "",
        churchPosition: data.churchPosition ?? "",
        city: data.city ?? "",
        shift: data.shift ?? "",
        status: data.status ?? "",
        createdAt,
      };
    })
    .filter((p: Presenca) => p.timestamp && p.timestamp instanceof Date);
}

export async function getPresencasByRegion(region: string): Promise<Presenca[]> {
  const q = query(collection(db, "attendance"), where("region", "==", region));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    let createdAt: Date | undefined = undefined;
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt;
      } else if (typeof data.createdAt === "number") {
        createdAt = new Date(data.createdAt);
      }
    }
    return {
      id: doc.id,
      timestamp: createdAt ?? new Date(),
      fullName: data.fullName ?? "",
      cpf: data.cpf ?? "",
      reclassification: data.reclassification ?? "",
      pastorName: data.pastorName ?? "",
      region: data.region ?? "",
      churchPosition: data.churchPosition ?? "",
      city: data.city ?? "",
      shift: data.shift ?? "",
      status: data.status ?? "",
      createdAt,
    };
  }).filter((p: Presenca) => p.createdAt && p.createdAt instanceof Date);
}

export async function getPresencaStats() {
  const snapshot = await getDocs(collection(db, "attendance"));
  const rows = snapshot.docs.map(doc => doc.data());
  const stats: any = {
    total: rows.length,
    present: rows.filter((r: any) => r.status === "Presente").length,
    justified: rows.filter((r: any) => r.status === "Justificado").length,
    absent: rows.filter((r: any) => r.status === "Ausente").length,
    byShift: {} as Record<string, number>,
    byRegion: {} as Record<string, number>,
    byPosition: {} as Record<string, number>,
    byReclassification: {} as Record<string, number>,
  };
  for (const r of rows) {
    if (r.status === "Presente") {
      stats.byShift[r.shift] = (stats.byShift[r.shift] || 0) + 1;
      stats.byRegion[r.region] = (stats.byRegion[r.region] || 0) + 1;
      stats.byPosition[r.churchPosition] = (stats.byPosition[r.churchPosition] || 0) + 1;
      stats.byReclassification[r.reclassification] = (stats.byReclassification[r.reclassification] || 0) + 1;
    }
  }
  stats.attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 10000) / 100 : 0;
  return stats;
}
