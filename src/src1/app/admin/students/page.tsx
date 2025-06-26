
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Edit, Trash2 } from "lucide-react"; // Utilisation de UserPlus pour ajouter des élèves
import { mockData } from '@/lib/mock-data';
import type { Apprenant, Utilisateur, Classe, Parent } from '@/types';
import { StudentForm } from '@/components/admin/students/StudentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ManageStudentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Apprenant | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingStudent ? "Élève modifié avec succès." : "Élève ajouté avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };
  
  const getStudentDetails = (student: Apprenant): Utilisateur | undefined => {
    return mockData.utilisateurs.find(u => u.id === student.utilisateurId);
  };
  const getClasseName = (classeId: string): string => {
    const classe = mockData.classes.find(c => c.id === classeId);
    return classe ? classe.nom : "Inconnue";
  };
  const getParentName = (parentId?: string): string => {
    if (!parentId) return "N/A";
    const parent = mockData.parents.find(p => p.id === parentId);
    if (!parent) return "Inconnu";
    const utilisateur = mockData.utilisateurs.find(u => u.id === parent.utilisateurId);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Inconnu";
  };
  
  const canAddStudent = mockData.classes.length > 0; // Parents are optional for adding a student

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <UserPlus className="mr-3 h-8 w-8" /> Gérer les Élèves
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={!canAddStudent}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un Nouvel Élève
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Modifier l'Élève" : "Ajouter un Nouvel Élève"}</DialogTitle>
            </DialogHeader>
            {canAddStudent ? (
              <StudentForm
                initialData={editingStudent}
                classes={mockData.classes as Classe[]}
                parents={mockData.parents as Parent[]}
                utilisateurs={mockData.utilisateurs as Utilisateur[]}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingStudent(null);
                }}
              />
            ) : (
              <p className="text-muted-foreground p-4 text-center">
                Veuillez d'abord <a href="/admin/classes" className="underline text-primary">ajouter une classe</a>.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Élèves</CardTitle>
          <CardDescription>Administrez les dossiers des élèves et leurs affectations.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.apprenants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucun élève inscrit pour le moment.</p>
              <p>Cliquez sur "Ajouter un Nouvel Élève" pour commencer.</p>
              {!canAddStudent && (
                <p className="mt-2 text-sm">
                  Note : Vous devez d'abord <a href="/admin/classes" className="underline text-primary">créer une classe</a>.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.apprenants.map((student) => {
                  const userDetails = getStudentDetails(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{userDetails?.nom || 'N/A'}</TableCell>
                      <TableCell>{userDetails?.prenom || 'N/A'}</TableCell>
                      <TableCell>{userDetails?.email || 'N/A'}</TableCell>
                      <TableCell>{getClasseName(student.classeId)}</TableCell>
                      <TableCell>{getParentName(student.parentId)}</TableCell>
                      <TableCell>{format(new Date(student.dateInscription), 'PPP', { locale: fr })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => alert("Fonctionnalité d'édition à implémenter")} className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => alert("Fonctionnalité de suppression à implémenter")} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
