// src/types/timetable.ts

// Import JourSemaine from local types
import type { JourSemaine } from './index';

export interface TimeSlot {
  id: string;
  startTime: string; 
  endTime: string; 
}

export interface Subject {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface SchoolClass {
  id: string;
  name: string;
}

// Interface pour les créneaux dans les données parsées, utilisée par TimetableDisplay
export interface TimetableSlot {
  day: JourSemaine; // Utilise l'enum JourSemaine local
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string; // Optionnel si c'est un emploi du temps de classe
  class?: string;   // Optionnel si c'est un emploi du temps d'enseignant
  room?: string;
}

// Structure attendue par TimetableDisplay
export interface ParsedScheduleData {
  className?: string; // Pour l'emploi du temps d'une classe
  teacherName?: string; // Pour l'emploi du temps d'un enseignant
  termName?: string; // Nom du trimestre/période
  slots: TimetableSlot[];
}


export interface TimetableEntry {
  id: string;
  timeSlot: TimeSlot;
  subject: Subject;
  teacher: Teacher;
  room: Room;
  schoolClass: SchoolClass;
  dayOfWeek: JourSemaine; // Utilise l'enum JourSemaine local
}

export interface Timetable {
  id: string;
  name: string;
  academicYearId: string;
  termId: string;
  entries: TimetableEntry[];
}

export interface DailyTimetable {
  dayOfWeek: JourSemaine; // Utilise l'enum JourSemaine local
  entries: TimetableEntry[];
}

export interface ClassTimetable {
  schoolClass: SchoolClass;
  dailyTimetables: DailyTimetable[];
}

export interface TeacherTimetable {
  teacher: Teacher;
  dailyTimetables: DailyTimetable[];
}

export interface RoomTimetable {
  room: Room;
  dailyTimetables: DailyTimetable[];
}
