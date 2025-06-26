import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateTeacherSchema = z.object({
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const teacherId = params.id;
  console.log(`➡️ PUT /api/professeurs/${teacherId}: Received request`);

  if (!teacherId) {
    console.error(`❌ PUT /api/professeurs/${teacherId}: Invalid ID`);
    return NextResponse.json({ message: 'ID de professeur invalide' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log(`📝 PUT /api/professeurs/${teacherId}: Request body:`, body);
    const validatedData = updateTeacherSchema.parse(body);
    console.log(`✅ PUT /api/professeurs/${teacherId}: Validation successful:`, validatedData);

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: validatedData,
      include: {
        user: true,
        subjects: true,
        classes: true,
      },
    });
    console.log(`⬅️ PUT /api/professeurs/${teacherId}: Successfully updated teacher:`, updatedTeacher);
    return NextResponse.json(updatedTeacher);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error(`❌ PUT /api/professeurs/${teacherId}: Validation error:`, error.errors);
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
    console.error(`❌ PUT /api/professeurs/${teacherId}: Error updating teacher:`, error);
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ message: 'Erreur lors de la mise à jour du professeur', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const teacherId = params.id;
    console.log(`➡️ DELETE /api/professeurs/${teacherId}: Received request`);

    if (!teacherId) {
        console.error(`❌ DELETE /api/professeurs/${teacherId}: Missing teacher ID`);
        return NextResponse.json({ message: "ID de professeur manquant" }, { status: 400 });
    }

    try {
        const deletedTeacher = await prisma.teacher.delete({
            where: { id: teacherId },
        });
        console.log(`⬅️ DELETE /api/professeurs/${teacherId}: Successfully deleted teacher:`, deletedTeacher);
        return NextResponse.json(deletedTeacher);
    } catch (error: any) {
        if (error instanceof prisma.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                console.error(`❌ DELETE /api/professeurs/${teacherId}: Teacher not found`);
                return NextResponse.json({ message: "Professeur non trouvé" }, { status: 404 });
            }
        }
        console.error(`❌ DELETE /api/professeurs/${teacherId}: Error deleting teacher:`, error);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
        return NextResponse.json({ message: "Erreur lors de la suppression du professeur", error: String(error) }, { status: 500 });
    }
}
