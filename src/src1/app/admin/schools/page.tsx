
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, School, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { Etablissement } from '@/types';
import { SchoolForm } from '@/components/admin/schools/SchoolForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


export default function ManageSchoolsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Etablissement | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingSchool(null);
    router.refresh(); // Crucial pour actualiser les données côté serveur
    toast({
      title: "Succès",
      description: editingSchool ? "Établissement modifié avec succès." : "Établissement ajouté avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingSchool(null);
    setIsDialogOpen(true);
  };

  // Les fonctions d'édition et de suppression sont des placeholders pour le moment
  const openEditDialog = (school: Etablissement) => {
    setEditingSchool(school);
    setIsDialogOpen(true);
    // Note: Pour que l'édition fonctionne, SchoolForm et handleEditSchool doivent être pleinement implémentés.
    alert("La fonctionnalité d'édition sera bientôt disponible. Pour l'instant, le formulaire s'ouvrira avec les données, mais la soumission effectuera une action d'ajout si non adaptée.");
  };

  const handleDelete = async (schoolId: string) => {
    // Ceci est un placeholder. L'action réelle devrait être appelée ici.
    // Pour l'exemple, nous allons simuler la suppression dans mockData et rafraîchir.
    // Dans une vraie app, vous appelleriez une Server Action.
    const index = mockData.etablissements.findIndex(e => e.id === schoolId);
    if (index > -1) {
      mockData.etablissements.splice(index, 1);
      router.refresh();
      toast({ title: "Établissement (simulé) supprimé", variant: "default" });
    } else {
      toast({ title: "Erreur", description: "Établissement non trouvé pour la suppression simulée.", variant: "destructive" });
    }
     alert("Fonctionnalité de suppression à implémenter avec une Server Action.");
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <School className="mr-3 h-8 w-8" /> Gérer les Établissements
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un Établissement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSchool ? "Modifier l'Établissement" : "Ajouter un Nouvel Établissement"}</DialogTitle>
            </DialogHeader>
            <SchoolForm 
              initialData={editingSchool} 
              onSuccess={handleFormSuccess} 
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSchool(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Établissements</CardTitle>
          <CardDescription>Voir, modifier ou ajouter des établissements au système.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.etablissements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucun établissement configuré pour le moment.</p>
              <p>Cliquez sur "Ajouter un Nouvel Établissement" pour commencer.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.etablissements.map((etab) => (
                  <TableRow key={etab.id}>
                    <TableCell className="font-medium">{etab.nom}</TableCell>
                    <TableCell>{etab.adresse}</TableCell>
                    <TableCell>{etab.telephone}</TableCell>
                    <TableCell>{etab.email}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(etab)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(etab.id)} className="text-destructive hover:text-destructive/80">
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
