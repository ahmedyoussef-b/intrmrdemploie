
import { PrismaClient, Role, UserSex, Day } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const HASH_ROUNDS = 10;

async function main() {
  console.log('Starting seeding process...');

  // 1. CLEAR EXISTING DATA in a safe order
  console.log('Clearing existing data...');
  await prisma.lesson.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.class.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.user.deleteMany();
  console.log('Data cleared.');

  // 2. CREATE ADMINS
  console.log('Creating admins...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', HASH_ROUNDS);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@shudwelcome.com',
      password: hashedPasswordAdmin,
      role: Role.ADMIN,
      active: true,
      admin: {
        create: {},
      },
    },
  });
  console.log('Admins created.');

  // 3. CREATE GRADES
  console.log('Creating grades...');
  const gradesData = [
    { level: 1 },
    { level: 2 },
    { level: 3 },
    { level: 4 },
    { level: 5 },
    { level: 6 },
  ];
  const createdGrades = [];
  for (const grade of gradesData) {
      const newGrade = await prisma.grade.create({ data: grade });
      createdGrades.push(newGrade);
  }
  console.log('Grades created.');

  // 4. CREATE CLASSES
  console.log('Creating classes...');
  const classesData = [
    { name: 'CP A', abbreviation: 'CPA', capacity: 25, gradeId: createdGrades[0].id },
    { name: 'CE1 B', abbreviation: 'CE1B', capacity: 28, gradeId: createdGrades[1].id },
    { name: '6ème Z', abbreviation: '6Z', capacity: 30, gradeId: createdGrades[5].id },
    { name: '6ème Y', abbreviation: '6Y', capacity: 29, gradeId: createdGrades[5].id },
    { name: '5ème A', abbreviation: '5A', capacity: 31, gradeId: createdGrades[4].id },
    { name: '4ème B', abbreviation: '4B', capacity: 28, gradeId: createdGrades[3].id },
    { name: '3ème C', abbreviation: '3C', capacity: 27, gradeId: createdGrades[2].id },
  ];
  const createdClasses = [];
  for (const classData of classesData) {
      const newClass = await prisma.class.create({ data: classData });
      createdClasses.push(newClass);
  }
  console.log('Classes created.');

  // 5. CREATE SUBJECTS
  console.log('Creating subjects...');
  const subjectsData = [
    { name: 'Mathématiques', weeklyHours: 5, coefficient: 4 },
    { name: 'Français', weeklyHours: 6, coefficient: 5 },
    { name: 'Histoire-Géo', weeklyHours: 3, coefficient: 3 },
    { name: 'Sciences de la Vie et de la Terre', weeklyHours: 2, coefficient: 2 },
    { name: 'Éducation Physique et Sportive', weeklyHours: 2, coefficient: 1 },
    { name: 'Allemand', weeklyHours: 3, coefficient: 2 },
  ];
  const createdSubjects = [];
  for (const subjectData of subjectsData) {
      const newSubject = await prisma.subject.create({ data: subjectData });
      createdSubjects.push(newSubject);
  }
  console.log('Subjects created.');

  // 6. CREATE CLASSROOMS
  console.log('Creating classrooms...');
  const classroomsData = [
      { name: 'Salle 101', abbreviation: 'S101', capacity: 30, building: 'A' },
      { name: 'Salle 102', abbreviation: 'S102', capacity: 30, building: 'A' },
      { name: 'Salle 203', abbreviation: 'S203', capacity: 32, building: 'B' },
      { name: 'Salle 204', abbreviation: 'S204', capacity: 28, building: 'B' },
      { name: 'Salle Polyvalente', abbreviation: 'POLY', capacity: 60, building: 'C' },
      { name: 'Gymnase', abbreviation: 'GYM', capacity: 50, building: 'C' },
  ];
  const createdClassrooms = [];
  for (const classroomData of classroomsData) {
      const newClassroom = await prisma.classroom.create({ data: classroomData });
      createdClassrooms.push(newClassroom);
  }
  console.log('Classrooms created.');


  // 7. CREATE TEACHERS AND RELATIONS
  console.log('Creating teachers and relations...');
  const hashedPasswordTeacher = await bcrypt.hash('prof123', HASH_ROUNDS);

  const teacher1 = await prisma.user.create({
      data: {
          username: 'mdupont',
          email: 'm.dupont@shudwelcome.com',
          password: hashedPasswordTeacher,
          role: Role.TEACHER,
          active: true,
          teacher: {
              create: {
                  name: 'Michel',
                  surname: 'Dupont',
                  phone: '0601020304',
                  address: '1 rue de la Paix',
                  subjects: { connect: [{ id: createdSubjects[0].id }, { id: createdSubjects[3].id }] },
                  sex: UserSex.MALE,
                  classes: { connect: [{ id: createdClasses[2].id }, { id: createdClasses[3].id }] },
              }
          }
      },
      include: { teacher: true }
  });

  const teacher2 = await prisma.user.create({
    data: {
        username: 'sdurand',
        email: 's.durand@shudwelcome.com',
        password: hashedPasswordTeacher,
        role: Role.TEACHER,
        active: true,
        teacher: {
            create: {
                name: 'Sophie',
                surname: 'Durand',
                phone: '0605060708',
                address: '2 avenue de la République',
                subjects: { connect: [{ id: createdSubjects[1].id }, { id: createdSubjects[2].id }] },
                sex: UserSex.FEMALE,
                classes: { connect: [{ id: createdClasses[0].id }, { id: createdClasses[1].id }] },
            }
        }
    },
    include: { teacher: true }
  });

  const teacher3 = await prisma.user.create({
    data: {
        username: 'aschmidt',
        email: 'a.schmidt@shudwelcome.com',
        password: hashedPasswordTeacher,
        role: Role.TEACHER,
        active: true,
        teacher: {
            create: {
                name: 'Anna',
                surname: 'Schmidt',
                phone: '0610111213',
                address: '3 Place de Berlin',
                subjects: { connect: [{ id: createdSubjects[1].id }, { id: createdSubjects[5].id }] }, // Français & Allemand
                sex: UserSex.FEMALE,
                classes: { connect: [{ id: createdClasses[2].id }] }, // 6ème Z
            }
        }
    },
    include: { teacher: true }
  });

  const createdTeachers = [teacher1.teacher, teacher2.teacher, teacher3.teacher];
  console.log('Teachers created.');


  // 8. CREATE PARENTS
  console.log('Creating parents...');
  const hashedPasswordParent = await bcrypt.hash('parent123', HASH_ROUNDS);
  const parent1 = await prisma.user.create({
      data: {
          username: 'jmartin',
          email: 'j.martin@email.com',
          password: hashedPasswordParent,
          role: Role.PARENT,
          active: true,
          parent: {
              create: {
                  name: 'Jacques',
                  surname: 'Martin',
                  phone: '0701020304',
              }
          }
      },
      include: { parent: true }
  });
  const createdParents = [parent1.parent];
  console.log('Parents created.');

  // 9. CREATE STUDENTS
  console.log('Creating students...');
  const hashedPasswordStudent = await bcrypt.hash('student123', HASH_ROUNDS);
  const student1 = await prisma.user.create({
      data: {
          username: 'lmartin',
          email: 'l.martin@email.com',
          password: hashedPasswordStudent,
          role: Role.STUDENT,
          active: true,
          student: {
              create: {
                  name: 'Léo',
                  surname: 'Martin',
                  class: {
                      connect: { id: createdClasses[2].id } 
                  }, 
                  parent: { connect: { id: createdParents[0]?.id } },
                  grade: { 
                      connect: { id: createdClasses[2].gradeId } 
                  }
              }
          }
      },
      include: { student: true }
  });
  const createdStudents = [student1.student];
  console.log('Students created.');

  // 10. CREATE LESSONS
  console.log('Creating lessons...');
  if (createdTeachers[0] && createdTeachers[1]) {
    await prisma.lesson.create({
      data: {
        name: 'Maths - Monday 8:00',
        day: Day.MONDAY,
        startTime: new Date('2023-01-01T08:00:00.000Z'),
        endTime: new Date('2023-01-01T09:00:00.000Z'),
        subjectId: createdSubjects[0].id, // Maths
        classId: createdClasses[2].id, // 6ème Z
        teacherId: createdTeachers[0].id,
        classroomId: createdClassrooms[0].id,
      },
    });
    await prisma.lesson.create({
      data: {
        name: 'Français - Monday 9:00',
        day: Day.MONDAY,
        startTime: new Date('2023-01-01T09:00:00.000Z'),
        endTime: new Date('2023-01-01T10:00:00.000Z'),
        subjectId: createdSubjects[1].id, // Français
        classId: createdClasses[0].id, // CP A
        teacherId: createdTeachers[1].id,
        classroomId: createdClassrooms[1].id,
      },
    });
     await prisma.lesson.create({
      data: {
        name: 'EPS - Tuesday 10:00',
        day: Day.TUESDAY,
        startTime: new Date('2023-01-01T10:00:00.000Z'),
        endTime: new Date('2023-01-01T11:00:00.000Z'),
        subjectId: createdSubjects[4].id, // EPS
        classId: createdClasses[2].id, // 6ème Z
        teacherId: createdTeachers[0].id,
        classroomId: createdClassrooms[2].id, // Gymnase
      },
    });
  }
  console.log('Lessons created.');

}

main()
  .then(async () => {
    console.log('Seeding completed successfully.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
