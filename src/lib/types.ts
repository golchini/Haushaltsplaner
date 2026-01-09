// ============ CORE TYPES ============

export interface Task {
  id: number;
  title: string;
  scheduled_time: string | null; // "14:30"
  done: boolean;
  date: string; // "2026-01-09"
  category: 'training' | 'haushalt' | 'arbeit' | 'sozial' | 'sonstiges';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface Termin {
  id: number;
  title: string;
  date: string; // "2026-01-14"
  time: string | null; // "18:00"
  location: string | null;
  notes: string | null;
  done: boolean;
  created_at: string;
}

export interface Rezept {
  id: number;
  name: string;
  kategorie: 'iranisch' | 'italienisch' | 'japanisch' | 'sonstiges';
  portionen: number; // Default portions
  zubereitungszeit: number; // Minuten
  zutaten: Zutat[];
  anleitung: string[];
  tags: string[]; // ["schnell", "meal-prep", "vegetarisch"]
  created_at: string;
}

export interface Zutat {
  name: string;
  menge: number;
  einheit: string; // "g", "ml", "Stück", "EL", "TL"
  optional: boolean;
}

export interface Gericht {
  id: number;
  rezept_id: number;
  rezept_name: string;
  portionen: number;
  woche: string; // "2026-W02"
  created_at: string;
}

export interface Mahlzeit {
  id: number;
  date: string; // "2026-01-09"
  typ: 'fruehstueck' | 'mittag' | 'abend';
  beschreibung: string;
  gericht_id: number | null;
  done: boolean;
}

export interface EinkaufsItem {
  id: number;
  name: string;
  menge: string | null;
  kategorie: 'dringend' | 'diese_woche' | 'sonstiges';
  done: boolean;
  auto_generated: boolean; // From Kochplaner
  created_at: string;
}

export interface TrainingsBlock {
  id: number;
  name: string; // "Push", "Pull", "Legs", "Upper"
  tag: 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';
  uebungen: Uebung[];
}

export interface Uebung {
  name: string;
  saetze: number;
  wiederholungen: string; // "8-10" or "max"
}

export interface Profil {
  name: string;
  ort: string;
  beruf: string;
  selbststaendig: string;
  jobsuche: string;
  gym_zeiten: Record<string, string>;
  ai_regeln: string[];
  praeferenzen: Record<string, string>;
}

// ============ API RESPONSE TYPES ============

export interface DashboardData {
  datum: string;
  tasks: Task[];
  termine_heute: Termin[];
  termine_bald: Termin[];
  mahlzeiten: Mahlzeit[];
  fortschritt: {
    erledigt: number;
    total: number;
    prozent: number;
  };
  aufbrauchen: string[];
}

export interface WochenplanData {
  woche: string;
  gerichte: Gericht[];
  mahlzeiten: Mahlzeit[];
  portionen_total: number;
  portionen_ziel: number;
}

export interface CheckinData {
  datum: string;
  training: string | null;
  haushalt: string[];
  termine: Termin[];
  mahlzeiten: Mahlzeit[];
  aufbrauchen: string[];
  fragen: string[];
}
