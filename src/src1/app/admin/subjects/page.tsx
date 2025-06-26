
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { Matiere, Etablissement } from '@/types';
import { SubjectForm } from '@/components/admin/subjects/SubjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ManageSubjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Matiere | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingSubject(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingSubject ? "Matière modifiée avec succès." : "Matière ajoutée avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setIsDialogOpen(true);
  };
  
  // Placeholder pour trouver le nom de l'établissement
  const getEtablissementName = (etablissementId: string): string => {
    const etab = mockData.etablissements.find(e => e.id === etablissementId);
    return etab ? etab.nom : "Inconnu";
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <BookOpen className="mr-3 h-8 w-8" /> Gérer les Matières
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={mockData.etablissements.length === 0}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Matière
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Modifier la Matière" : "Ajouter une Nouvelle Matière"}</DialogTitle>
            </DialogHeader>
            {mockData.etablissements.length > 0 ? (
              <SubjectForm
                initialData={editingSubject}
                etablissements={mockData.etablissements}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingSubject(null);
                }}
              />
            ) : (
              <p className="text-muted-foreground p-4 text-center">
                Veuillez d'abord <a href="/admin/schools" className="underline text-primary">ajouter un établissement</a> avant d'ajouter des matières.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Catalogue des Matières</CardTitle>
          <CardDescription>Définissez les matières, catégories, durées et priorités.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.matieres.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucune matière définie pour le moment.</p>
              <p>Cliquez sur "Ajouter une Nouvelle Matière" pour construire le catalogue.</p>
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
                  <TableHead>Code</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.matieres.map((matiere) => (
                  <TableRow key={matiere.id}>
                    <TableCell className="font-medium">{matiere.nom}</TableCell>
                    <TableCell><Badge variant="secondary">{matiere.code}</Badge></TableCell>
                    <TableCell>{matiere.categorie}</TableCell>
                    <TableCell>{getEtablissementName(matiere.etablissementId)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => alert("Fonctionnalité d'édition à implémenter")} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => alert("Fonctionnalité de suppression à implémenter")} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
