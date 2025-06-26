
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { Enseignant, Utilisateur, Etablissement } from '@/types';
import { TeacherForm } from '@/components/admin/teachers/TeacherForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ManageTeachersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Enseignant | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingTeacher ? "Enseignant modifié avec succès." : "Enseignant ajouté avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingTeacher(null);
    setIsDialogOpen(true);
  };
  
  const getTeacherDetails = (teacher: Enseignant): Utilisateur | undefined => {
    return mockData.utilisateurs.find(u => u.id === teacher.utilisateurId);
  };
  const getEtablissementName = (etablissementId: string): string => {
    const etab = mockData.etablissements.find(e => e.id === etablissementId);
    return etab ? etab.nom : "Inconnu";
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <Users className="mr-3 h-8 w-8" /> Gérer les Enseignants
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={mockData.etablissements.length === 0}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un Nouvel Enseignant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Modifier l'Enseignant" : "Ajouter un Nouvel Enseignant"}</DialogTitle>
            </DialogHeader>
             {mockData.etablissements.length > 0 ? (
                <TeacherForm
                    initialData={editingTeacher}
                    etablissements={mockData.etablissements as Etablissement[]}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingTeacher(null);
                    }}
                />
            ) : (
              <p className="text-muted-foreground p-4 text-center">
                Veuillez d'abord <a href="/admin/schools" className="underline text-primary">ajouter un établissement</a>.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Enseignants</CardTitle>
          <CardDescription>Gérez les profils des enseignants, leurs affectations et disponibilités.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.enseignants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucun enseignant ajouté pour le moment.</p>
              <p>Cliquez sur "Ajouter un Nouvel Enseignant" pour peupler la liste.</p>
              {mockData.etablissements.length === 0 && (
                <p className="mt-2 text-sm">
                  Note : Vous devez d'abord <a href="/admin/schools" className="underline text-primary">créer un établissement</a>.
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
                  <TableHead>Établissement</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Date d'embauche</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.enseignants.map((enseignant) => {
                  const userDetails = getTeacherDetails(enseignant);
                  return (
                    <TableRow key={enseignant.id}>
                      <TableCell className="font-medium">{userDetails?.nom || 'N/A'}</TableCell>
                      <TableCell>{userDetails?.prenom || 'N/A'}</TableCell>
                      <TableCell>{userDetails?.email || 'N/A'}</TableCell>
                      <TableCell>{getEtablissementName(enseignant.etablissementId)}</TableCell>
                      <TableCell><Badge variant="secondary">{enseignant.specialitePrincipale}</Badge></TableCell>
                      <TableCell>{format(new Date(enseignant.dateEmbauche), 'PPP', { locale: fr })}</TableCell>
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
