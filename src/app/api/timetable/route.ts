
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, Day } from '@prisma/client';

const createLessonSchema = z.object({
  name: z.string(),
  day: z.nativeEnum(Day),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  subjectId: z.number().int(),
  classId: z.number().int(),
  teacherId: z.string(),
  classroomId: z.number().int(),
});

const createTimetableSchema = z.array(createLessonSchema);

export async function GET() {
  console.log('➡️ GET /api/timetable: Received request');
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        subject: true,
        class: { include: { grade: true } },
        teacher: true,
        classroom: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    console.log(`⬅️ GET /api/timetable: Success, found ${lessons.length} lessons.`);
    return NextResponse.json(lessons);
  } catch (error: any) {
    console.error('❌ GET /api/timetable: Error fetching lessons:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération de l\'emploi du temps', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('➡️ POST /api/timetable: Received request');
  try {
    const body = await request.json();
    const validatedData = createTimetableSchema.parse(body);
    console.log(`✅ POST /api/timetable: Validation successful, creating ${validatedData.length} lessons.`);
    
    // Use a transaction to ensure atomicity: first delete all old lessons, then create new ones.
    const transaction = await prisma.$transaction([
      prisma.lesson.deleteMany({}),
      prisma.lesson.createMany({
        data: validatedData,
      }),
    ]);

    console.log(`⬅️ POST /api/timetable: Success, transaction completed. Deleted: ${transaction[0].count}, Created: ${transaction[1].count}`);
    return NextResponse.json({ message: 'Emploi du temps sauvegardé avec succès', createdCount: transaction[1].count }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('❌ POST /api/timetable: Validation error:', error.errors);
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
    console.error('❌ POST /api/timetable: General error creating timetable:', error);
    return NextResponse.json({ message: 'Erreur lors de la sauvegarde de l\'emploi du temps', error: String(error) }, { status: 500 });
  }
}
