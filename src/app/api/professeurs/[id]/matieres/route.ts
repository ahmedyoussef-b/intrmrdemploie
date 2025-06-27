import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.number()),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const teacherId = params.id;
  console.log(`➡️ POST /api/professeurs/${teacherId}/matieres: Received request`);

  if (!teacherId) {
    console.error(`❌ POST /api/professeurs/${teacherId}/matieres: Invalid ID`);
    return NextResponse.json({ message: 'ID de professeur invalide' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log(`📝 POST /api/professeurs/${teacherId}/matieres: Request body:`, body);
    const { subjectIds } = assignSubjectsSchema.parse(body);
    console.log(`✅ POST /api/professeurs/${teacherId}/matieres: Validation successful:`, subjectIds);

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        subjects: {
          set: subjectIds.map((id) => ({ id })),
        },
      },
      include: {
        user: true,
        subjects: true,
        classes: true,
      },
    });

    console.log(`⬅️ POST /api/professeurs/${teacherId}/matieres: Successfully assigned subjects:`, updatedTeacher);
    return NextResponse.json(updatedTeacher);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error(`❌ POST /api/professeurs/${teacherId}/matieres: Validation error:`, error.errors);
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
    console.error(`❌ POST /api/professeurs/${teacherId}/matieres: Error assigning subjects:`, error);
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ message: "Erreur lors de l'assignation des matières", error: String(error) }, { status: 500 });
  }
}
