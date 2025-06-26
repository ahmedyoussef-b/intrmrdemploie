
/**
 * @fileOverview Ce fichier centralise et exporte tous les types de données de l'application,
 * en particulier ceux générés par Prisma et les types composites personnalisés utilisés
 * dans les API et les composants de l'interface utilisateur.
 */

import type {
  Prisma,
  User,
  Admin,
  Teacher,
  Student,
  Parent,
  Grade,
  Class,
  Subject,
  Classroom,
  Lesson,
  Role,
  UserSex,
  Day,
} from '@prisma/client';

// -----------------------------------------------------------------------------
// ENUMS & MODÈLES DE BASE (Ré-exportés depuis Prisma)
// -----------------------------------------------------------------------------

export {
  type User,
  type Admin,
  type Teacher,
  type Student,
  type Parent,
  type Grade,
  type Class,
  type Subject,
  type Classroom,
  type Lesson,
  Role,
  UserSex,
  Day,
};

// -----------------------------------------------------------------------------
// TYPES COMPOSITES (Avec relations incluses)
// -----------------------------------------------------------------------------

/**
 * Type pour une `Class` qui inclut les informations sur son `Grade` (niveau).
 * Utilisé pour afficher le nom du niveau à côté de la classe.
 */
const classWithGrade = Prisma.validator<Prisma.ClassDefaultArgs>()({
  include: { grade: true },
});
export type ClassWithGrade = Prisma.ClassGetPayload<typeof classWithGrade>;

/**
 * Type pour un `Teacher` qui inclut les informations de l'utilisateur associé (`User`),
 * la liste de ses `Subject` (matières) et de ses `Class` (classes).
 * C'est le type le plus complet pour un professeur.
 */
const teacherWithDetails = Prisma.validator<Prisma.TeacherDefaultArgs>()({
  include: {
    user: true,
    subjects: true,
    classes: true,
  },
});
export type TeacherWithDetails = Prisma.TeacherGetPayload<
  typeof teacherWithDetails
>;

/**
 * Type pour une `Lesson` qui inclut toutes ses relations pour un affichage complet.
 */
const lessonWithDetails = Prisma.validator<Prisma.LessonDefaultArgs>()({
  include: {
    subject: true,
    class: { include: { grade: true } },
    teacher: true,
    classroom: true,
  },
});
export type LessonWithDetails = Prisma.LessonGetPayload<typeof lessonWithDetails>;


// -----------------------------------------------------------------------------
// TYPES DE PAYLOAD POUR L'API (Pour la création de nouvelles entités)
// -----------------------------------------------------------------------------

/**
 * Charge utile pour la création d'une nouvelle `Subject` (matière).
 * Omet les champs auto-générés par la base de données.
 */
export type CreateSubjectPayload = {
  name: string;
  weeklyHours: number;
  coefficient?: number;
};

/**
 * Charge utile pour la création d'une nouvelle `Class` (classe).
 */
export type CreateClassPayload = {
  name: string;
  abbreviation?: string;
  capacity: number;
  gradeId: number;
};

/**
 * Charge utile pour la création d'une nouvelle `Classroom` (salle de classe).
 */
export type CreateClassroomPayload = {
  name: string;
  abbreviation?: string;
  capacity: number;
  building?: string;
};

/**
 * Charge utile pour la création d'un nouveau `Teacher` (professeur).
 * Cela créera un `User` et un `Teacher` liés en une seule transaction.
 */
export type CreateTeacherPayload = {
  name: string;
  surname: string;
  email: string;
  username: string;
  phone?: string;
  address?: string;
};

/**
 * Charge utile pour la création d'une `Lesson`.
 * Omet les champs auto-générés comme id, createdAt, updatedAt.
 */
export type CreateLessonPayload = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>;
