import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';

const HASH_ROUNDS = 10;

const createTeacherSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis'),
  surname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  console.log('➡️ GET /api/professeurs: Received request');
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        subjects: true,
        classes: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    console.log(`⬅️ GET /api/professeurs: Success, found ${teachers.length} teachers.`);
    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error('❌ GET /api/professeurs: Error fetching teachers:', error);
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      console.error('❌ GET /api/professeurs: A required table does not exist. Please run `prisma migrate dev`.');
       return NextResponse.json({ message: 'Erreur serveur : Une table requise pour les professeurs est introuvable. Veuillez exécuter les migrations de base de données.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Erreur lors de la récupération des professeurs', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('➡️ POST /api/professeurs: Received request');
  try {
    const body = await request.json();
    console.log('📝 POST /api/professeurs: Request body:', body);
    const { name, surname, email, username, phone, address } = createTeacherSchema.parse(body);
    console.log('✅ POST /api/professeurs: Validation successful:', { name, surname, email, username, phone, address });

    const hashedPassword = await bcrypt.hash('prof123', HASH_ROUNDS); // Default password
    console.log('🔑 POST /api/professeurs: Password hashed.');

    const result = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
        active: true,
        teacher: {
          create: {
            name,
            surname,
            phone,
            address,
          },
        },
      },
      include: {
        teacher: {
          include: {
            subjects: true,
            classes: true,
            user: true
          }
        },
      },
    });

    const newTeacher = result.teacher;
    console.log('⬅️ POST /api/professeurs: Success, created teacher:', newTeacher);
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('❌ POST /api/professeurs: Validation error:', error.errors);
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { 
            const target = (error.meta as {target?: string[]})?.target;
            if(target?.includes('email')) {
                console.error('❌ POST /api/professeurs: Email already exists:', email);
                return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà." }, { status: 409 });
            }
             if(target?.includes('username')) {
                console.error('❌ POST /api/professeurs: Username already exists:', username);
                return NextResponse.json({ message: "Un utilisateur avec ce nom d'utilisateur existe déjà." }, { status: 409 });
            }
        }
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        console.error("❌ POST /api/professeurs: An unknown Prisma error occurred. This often indicates a schema mismatch. Please run `prisma migrate dev`.", error);
        return NextResponse.json({ message: "Erreur de base de données inattendue. Assurez-vous que votre base de données est à jour." }, { status: 500 });
    }
    console.error('❌ POST /api/professeurs: General error creating teacher:', error);
    if (error.stack) {
        console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ message: 'Erreur lors de la création du professeur', error: String(error) }, { status: 500 });
  }
}
