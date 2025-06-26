
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, History, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { mockData } from '@/lib/mock-data';
import type { Periode, AnneeScolaire } from '@/types';
import { TermForm } from '@/components/admin/terms/TermForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ManageTermsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Periode | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingTerm(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingTerm ? "Période modifiée avec succès." : "Période ajoutée avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingTerm(null);
    setIsDialogOpen(true);
  };
  
  const getAnneeScolaireName = (anneeScolaireId: string): string => {
    const annee = mockData.anneesScolaires.find(a => a.id === anneeScolaireId);
    return annee ? annee.annee : "Inconnue";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary font-headline flex items-center">
          <History className="mr-3 h-8 w-8" /> Gérer les Périodes
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={mockData.anneesScolaires.length === 0}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Période
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTerm ? "Modifier la Période" : "Ajouter une Nouvelle Période"}</DialogTitle>
            </DialogHeader>
            {mockData.anneesScolaires.length > 0 ? (
              <TermForm
                initialData={editingTerm}
                anneesScolaires={mockData.anneesScolaires as AnneeScolaire[]}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingTerm(null);
                }}
              />
            ) : (
               <p className="text-muted-foreground p-4 text-center">
                Veuillez d'abord <a href="/admin/academic-years" className="underline text-primary">ajouter une année académique</a>.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Configuration des Périodes</CardTitle>
          <CardDescription>Définissez les périodes (ex: "Trimestre 1") au sein des années académiques.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.periodes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucune période configurée.</p>
              <p>Commencez par ajouter une période.</p>
               {mockData.anneesScolaires.length === 0 && (
                <p className="mt-2 text-sm">
                  Note : Vous devez d'abord <a href="/admin/academic-years" className="underline text-primary">créer une année académique</a>.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Année Scolaire</TableHead>
                  <TableHead>Date de Début</TableHead>
                  <TableHead>Date de Fin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.periodes.map((periode) => (
                  <TableRow key={periode.id}>
                    <TableCell className="font-medium">{periode.nom}</TableCell>
                    <TableCell>{getAnneeScolaireName(periode.anneeScolaireId)}</TableCell>
                    <TableCell>{format(new Date(periode.dateDebut), 'PPP', { locale: fr })}</TableCell>
                    <TableCell>{format(new Date(periode.dateFin), 'PPP', { locale: fr })}</TableCell>
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
