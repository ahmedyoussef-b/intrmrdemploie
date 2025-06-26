'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Puzzle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export default function ManageConstraintsPage() {
  const [isClassConstraintDialogOpen, setIsClassConstraintDialogOpen] = useState(false);
  const [isTeacherConstraintDialogOpen, setIsTeacherConstraintDialogOpen] = useState(false);
  const [isSubjectRequirementDialogOpen, setIsSubjectRequirementDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Puzzle className="mr-3 h-8 w-8" /> Gérer les Contraintes
        </h1>
      </div>

      <Tabs defaultValue="class_constraints" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="class_constraints">Contraintes de Classe</TabsTrigger>
          <TabsTrigger value="teacher_constraints">Contraintes Enseignant</TabsTrigger>
          <TabsTrigger value="subject_requirements">Exigences Matière</TabsTrigger>
        </TabsList>
        
        <TabsContent value="class_constraints">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contraintes de Classe</CardTitle>
                <Dialog open={isClassConstraintDialogOpen} onOpenChange={setIsClassConstraintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Contrainte Classe</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter Contrainte de Classe</DialogTitle>
                      <DialogDescription>
                        Cette fonctionnalité d'ajout de contrainte de classe est en cours de développement.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Ici, vous pourrez définir des règles spécifiques pour les classes, par exemple, des matières à ne pas placer à certains moments.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Définir des contraintes pédagogiques ou de ressources spécifiques aux classes (ex: "Pas de Maths après le déjeuner pour la 6ème A").</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-lg mb-2">Aucune contrainte de classe définie pour le moment.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher_constraints">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contraintes Enseignant</CardTitle>
                 <Dialog open={isTeacherConstraintDialogOpen} onOpenChange={setIsTeacherConstraintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Contrainte Enseignant</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter Contrainte Enseignant</DialogTitle>
                      <DialogDescription>
                        Cette fonctionnalité d'ajout de contrainte enseignant est en cours de développement.
                      </DialogDescription>
                    </DialogHeader>
                     <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Ici, vous pourrez spécifier les indisponibilités des enseignants, leurs préférences, etc.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Définir les contraintes pour les enseignants, telles que l'indisponibilité, les préférences de salle ou de matière.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-lg mb-2">Aucune contrainte enseignant définie pour le moment.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject_requirements">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Exigences Matière</CardTitle>
                 <Dialog open={isSubjectRequirementDialogOpen} onOpenChange={setIsSubjectRequirementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter Exigence Matière</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter Exigence Matière</DialogTitle>
                      <DialogDescription>
                       Cette fonctionnalité d'ajout d'exigence matière est en cours de développement.
                      </DialogDescription>
                    </DialogHeader>
                     <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Ici, vous pourrez définir les besoins spécifiques des matières, comme un type de salle particulier.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Spécifier les exigences pour les matières, comme le besoin d'un type de salle spécifique (ex: "La Chimie nécessite un laboratoire de Sciences").</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-lg mb-2">Aucune exigence matière définie pour le moment.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
