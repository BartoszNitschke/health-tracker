export interface UserAttribute {
  name: string; // np. Siła, Głód, Energia, Nawodnienie, Luz
  emoji: string; // emoji reprezentujące atrybut
  progress: number; // 0-100
  color: string; // kolor paska/herbu
}

export interface SummaryStats {
  level: number; // poziom postaci
  currentXp: number; // aktualne XP w kierunku następnego poziomu
  completedDailyQuests: number; // ile dziennych wykonano
  totalDailyQuests: number; // ile dziennych jest dostępnych
  weeklyCompleted: number; // ile tygodniowych wykonano
  weeklyTotal: number; // ile tygodniowych jest
}

export interface DailyTarget {
  type: 'water' | 'calories' | 'steps' | 'breaks' | 'meals' | 'meditation';
  label: string; // np. Nawodnienie, Kalorie, Kroki, Przerwy, Posiłki, Medytacja
  current: number; // aktualna wartość (np. 5 szklanek)
  goal: number; // cel (np. 8 szklanek)
  unit: string; // np. 'szklanek wody', 'kcal', 'kroków', 'przerw od ekranu'
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  rewardXp: number;
  progressCurrent: number;
  progressGoal: number;
  status: 'not_started' | 'in_progress' | 'completed';
  // opcjonalne powiązanie z dziennym celem, jeśli quest pokrywa się z celem
  linkedDailyTargetType?: DailyTarget['type'];
}

export interface Badge {
  id: string;
  icon: string; // nazwa ikony material np. 'water_drop'
  shieldColor: string; // kolor herbu/tła
  name: string;
  description: string;
  acquiredAt: string; // ISO date string
}

export interface ExerciseBonuses {
  strength: number; // bonus % do siły z treningu
  luz: number; // bonus % do luzu z medytacji
  energy: number; // bonus/malus % do energii z snu/treningu/medytacji
  hunger: number; // bonus/malus % do głodu z aktywności
  hydration: number; // bonus/malus % do nawodnienia z aktywności
}

export interface UserProfile {
  id: string;
  fullName: string;
  attributes: UserAttribute[]; // 5 atrybutów
  summary: SummaryStats; // trzy statystyki z podsumowania
  dailyTargets: DailyTarget[]; // moje dzienne cele
  mainQuest: Quest; // quest główny
  dailyQuests: Quest[]; // questy dzienne
  badges: Badge[]; // odznaki
  exerciseBonuses: ExerciseBonuses; // bonusy z ćwiczeń
}
