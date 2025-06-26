import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  weeklyHours: z.number().int().positive().optional(),
  coefficient: z.number().int().positive().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  console.log(`➡️ PUT /api/matieres/${id}: Received request`);

  if (isNaN(id)) {
    console.error(`❌ PUT /api/matieres/${id}: Invalid ID`);
    return NextResponse.json({ message: 'ID de matière invalide' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log(`📝 PUT /api/matieres/${id}: Request body:`, body);
    const validatedData = updateSubjectSchema.parse(body);
    console.log(`✅ PUT /api/matieres/${id}: Validation successful:`, validatedData);

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: validatedData,
    });
    console.log(`⬅️ PUT /api/matieres/${id}: Successfully updated subject:`, updatedSubject);
    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error(`❌ PUT /api/matieres/${id}: Validation error:`, error.errors);
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
    console.error(`❌ PUT /api/matieres/${id}: Error updating subject:`, error);
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ message: 'Erreur lors de la mise à jour de la matière', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    console.log(`➡️ DELETE /api/matieres/${id}: Received request`);

    if (isNaN(id)) {
        console.error(`❌ DELETE /api/matieres/${id}: Invalid ID`);
        return NextResponse.json({ message: 'ID de matière invalide' }, { status: 400 });
    }

    try {
        const deletedSubject = await prisma.subject.delete({
            where: { id },
        });
        console.log(`⬅️ DELETE /api/matieres/${id}: Successfully deleted subject:`, deletedSubject);
        return NextResponse.json(deletedSubject);
    } catch (error: any) {
        if (error instanceof prisma.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            console.error(`❌ DELETE /api/matieres/${id}: Subject not found`);
            return NextResponse.json({ message: 'Matière non trouvée' }, { status: 404 });
        }
        console.error(`❌ DELETE /api/matieres/${id}: Error deleting subject:`, error);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
        return NextResponse.json({ message: "Erreur lors de la suppression de la matière", error: String(error) }, { status: 500 });
    }
}
