
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutDashboard, Edit, Trash2 } from "lucide-react";
import { mockData } from '@/lib/mock-data';
import type { Salle, Etablissement, OptionEquipementSalle } from '@/types';
import { RoomForm } from '@/components/admin/rooms/RoomForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ManageRoomsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Salle | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingRoom(null);
    router.refresh();
    toast({
      title: "Succès",
      description: editingRoom ? "Salle modifiée avec succès." : "Salle ajoutée avec succès.",
      variant: "default"
    });
  };

  const openAddDialog = () => {
    setEditingRoom(null);
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
          <LayoutDashboard className="mr-3 h-8 w-8" /> Gérer les Salles
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={mockData.etablissements.length === 0}>
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Nouvelle Salle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Modifier la Salle" : "Ajouter une Nouvelle Salle"}</DialogTitle>
            </DialogHeader>
            {mockData.etablissements.length > 0 ? (
              <RoomForm
                initialData={editingRoom}
                etablissements={mockData.etablissements as Etablissement[]}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingRoom(null);
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
          <CardTitle>Inventaire des Salles</CardTitle>
          <CardDescription>Listez et catégorisez les salles, leurs capacités et équipements.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockData.salles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Aucune salle ajoutée pour le moment.</p>
              <p>Cliquez sur "Ajouter une Nouvelle Salle" pour définir les espaces.</p>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Équipements</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.salles.map((salle) => (
                  <TableRow key={salle.id}>
                    <TableCell className="font-medium">{salle.nom}</TableCell>
                    <TableCell><Badge variant="outline">{salle.type.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{salle.capacite}</TableCell>
                    <TableCell>{getEtablissementName(salle.etablissementId)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {salle.equipements.map(eq => eq.replace("_", " ")).join(', ') || "-"}
                    </TableCell>
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
