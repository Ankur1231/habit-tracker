export interface Habit {
  id: string;
  emoji: string;
  name: string;
}

export interface CellMap {
  [habitId: string]: { [day: number]: boolean };
}

export interface MentalDay {
  mood: number;
  motivation: number;
}

export interface MentalMap {
  [day: number]: MentalDay;
}

export interface MonthData {
  habits: Habit[];
  cells: CellMap;
  mental: MentalMap;
}

export interface MonthsStore {
  [monthKey: string]: MonthData;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface WeekDay {
  day: number;
  dow: number;
}

export interface Week {
  index: number;
  days: WeekDay[];
}

export type DensityOption = 'compact' | 'regular' | 'comfy';
export type CheckStyle = 'fill' | 'box' | 'dot';
export type WeekScheme = 'rainbow' | 'cool' | 'warm' | 'mono';

export interface TweakValues {
  accent: string;
  weekScheme: WeekScheme;
  density: DensityOption;
  checkStyle: CheckStyle;
  showMental: boolean;
  showAnalysis: boolean;
  showArea: boolean;
  radius: number;
}
