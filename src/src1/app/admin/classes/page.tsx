
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { Classe, Etablissement, AnneeScolaire, Enseignant, Utilisateur } from '@/types';
import { ClassForm } from '@/components/admin/classes/ClassForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ManageClassesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingClass(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingClass ? "Classe modifiée avec succès." : "Classe ajoutée avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };
  
  const getEtablissementName = (id: string): string => mockData.etablissements.find(e => e.id === id)?.nom || "Inconnu";
  const getAnneeScolaireName = (id: string): string => mockData.anneesScolaires.find(a => a.id === id)?.annee || "Inconnue";
  const getProfesseurPrincipalName = (id?: string): string => {
    if (!id) return "N/A";
    const enseignant = mockData.enseignants.find(e => e.id === id);
    if (!enseignant) return "Inconnu";
    const utilisateur = mockData.utilisateurs.find(u => u.id === enseignant.utilisateurId);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Inconnu";
  };

  const canAddClass = mockData.etablissements.length > 0 && 
                      mockData.anneesScolaires.length > 0 &&
                      mockData.enseignants.length > 0;

  let prerequisiteMessage = "";
  if (mockData.etablissements.length === 0) prerequisiteMessage = "Veuillez d'abord ajouter un établissement.";
  else if (mockData.anneesScolaires.length === 0) prerequisiteMessage = "Veuillez d'abord ajouter une année académique.";
  else if (mockData.enseignants.length === 0) prerequisiteMessage = "Veuillez d'abord ajouter des enseignants (pour le professeur principal).";


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <Users className="mr-3 h-8 w-8" /> Gérer les Classes
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={!canAddClass}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Nouvelle Classe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingClass ? "Modifier la Classe" : "Ajouter une Nouvelle Classe"}</DialogTitle>
            </DialogHeader>
            {canAddClass ? (
              <ClassForm
                initialData={editingClass}
                etablissements={mockData.etablissements as Etablissement[]}
                anneesScolaires={mockData.anneesScolaires as AnneeScolaire[]}
                enseignants={mockData.enseignants as Enseignant[]}
                utilisateurs={mockData.utilisateurs as Utilisateur[]}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingClass(null);
                }}
              />
            ) : (
               <p className="text-muted-foreground p-4 text-center">
                {prerequisiteMessage} Veuillez consulter les sections correspondantes de l'administration.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Classes</CardTitle>
          <CardDescription>Organisez les classes, attribuez des niveaux et gérez les inscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.classes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucune classe créée pour le moment.</p>
              <p>Cliquez sur "Ajouter une Nouvelle Classe" pour configurer les classes.</p>
              {!canAddClass && (
                <p className="mt-2 text-sm">
                  Note : {prerequisiteMessage}
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Année Scolaire</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Prof. Principal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.classes.map((classe) => (
                  <TableRow key={classe.id}>
                    <TableCell className="font-medium">{classe.nom}</TableCell>
                    <TableCell><Badge variant="outline">{classe.niveau}</Badge></TableCell>
                    <TableCell>{getEtablissementName(classe.etablissementId)}</TableCell>
                    <TableCell>{getAnneeScolaireName(classe.anneeScolaireId)}</TableCell>
                    <TableCell>{classe.capacite}</TableCell>
                    <TableCell>{getProfesseurPrincipalName(classe.professeurPrincipalId)}</TableCell>
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
