
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { AnneeScolaire, Etablissement } from '@/types';
import { AcademicYearForm } from '@/components/admin/academic-years/AcademicYearForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ManageAcademicYearsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState<AnneeScolaire | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingAcademicYear(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingAcademicYear ? "Année académique modifiée avec succès." : "Année académique ajoutée avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingAcademicYear(null);
    setIsDialogOpen(true);
  };
  
  const getEtablissementName = (etablissementId: string): string => {
    const etab = mockData.etablissements.find(e => e.id === etablissementId);
    return etab ? etab.nom : "Inconnu";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" /> Gérer Années Académiques
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={mockData.etablissements.length === 0}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Année Académique
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAcademicYear ? "Modifier l'Année Académique" : "Ajouter une Année Académique"}</DialogTitle>
            </DialogHeader>
            {mockData.etablissements.length > 0 ? (
              <AcademicYearForm
                initialData={editingAcademicYear}
                etablissements={mockData.etablissements as Etablissement[]}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingAcademicYear(null);
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
          <CardTitle>Liste des Années Académiques</CardTitle>
          <CardDescription>Définissez les années académiques (ex: "2023-2024") et leurs dates.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.anneesScolaires.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucune année académique configurée.</p>
              <p>Commencez par ajouter une année académique.</p>
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
                  <TableHead>Année</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Date de Début</TableHead>
                  <TableHead>Date de Fin</TableHead>
                  <TableHead>Courante</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.anneesScolaires.map((annee) => (
                  <TableRow key={annee.id}>
                    <TableCell className="font-medium">{annee.annee}</TableCell>
                    <TableCell>{getEtablissementName(annee.etablissementId)}</TableCell>
                    <TableCell>{format(new Date(annee.dateDebut), 'PPP', { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(annee.dateFin), 'PPP', { locale: fr })}</TableCell>
                    <TableCell>{annee.estCourante ? "Oui" : "Non"}</TableCell>
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
