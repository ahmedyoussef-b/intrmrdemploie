import type { ClassWithGrade, Subject, TeacherWithDetails, Classroom } from './index';

export interface SchoolData {
  name: string;
  startTime: string;
  endTime: string;
  schoolDays: string[];
  sessionDuration: number;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

export interface WizardData {
  school: SchoolData;
  classes: ClassWithGrade[];
  subjects: Subject[];
  teachers: TeacherWithDetails[];
  rooms: Classroom[];
}
