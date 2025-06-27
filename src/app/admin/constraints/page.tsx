
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Puzzle, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { fetchClasses, selectAllClasses } from '@/lib/features/classes/classesSlice';
import { fetchMatieres, selectAllMatieres } from '@/lib/features/matieres/matieresSlice';
import type { ClassWithGrade, Subject } from '@/types';
import { Day } from '@prisma/client';

// Mock constraint structure for the UI
interface ClassConstraint {
  id: string;
  classId: number;
  subjectId: number;
  day: Day;
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'ANY';
  constraintType: 'FORBIDDEN' | 'DISCOURAGED';
  description: string;
}

export default function ManageConstraintsPage() {
  const dispatch = useAppDispatch();
  const classes = useAppSelector(selectAllClasses);
  const subjects = useAppSelector(selectAllMatieres);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [constraints, setConstraints] = useState<ClassConstraint[]>([
      // Example data
      {
          id: '1',
          classId: 3, // Corresponds to '6ème Z' in seed data if available
          subjectId: 1, // Corresponds to 'Mathématiques' in seed data if available
          day: 'MONDAY',
          timeOfDay: 'AFTERNOON',
          constraintType: 'DISCOURAGED',
          description: 'Pas de Maths le lundi après-midi pour la 6ème Z, les élèves sont moins attentifs.',
      },
  ]);
  
  // Form state for the dialog
  const [newConstraint, setNewConstraint] = useState({
      subjectId: '',
      day: '',
      timeOfDay: '',
      constraintType: 'FORBIDDEN',
      description: '',
  });

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchMatieres());
  }, [dispatch]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
        // Find a class that might exist in the mock constraints
        const mockClass = classes.find(c => c.id === 3);
        setSelectedClassId(String(mockClass ? mockClass.id : classes[0].id));
    }
  }, [classes, selectedClassId]);

  const filteredConstraints = useMemo(() => {
    if (!selectedClassId) return [];
    return constraints.filter(c => c.classId === parseInt(selectedClassId, 10));
  }, [constraints, selectedClassId]);
  
  const handleAddConstraint = () => {
    if (!selectedClassId || !newConstraint.subjectId || !newConstraint.day || !newConstraint.timeOfDay) {
        // Simple validation, can be improved with react-hook-form
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const newEntry: ClassConstraint = {
        id: Date.now().toString(),
        classId: parseInt(selectedClassId, 10),
        subjectId: parseInt(newConstraint.subjectId, 10),
        day: newConstraint.day as Day,
        timeOfDay: newConstraint.timeOfDay as 'MORNING' | 'AFTERNOON' | 'ANY',
        constraintType: newConstraint.constraintType as 'FORBIDDEN' | 'DISCOURAGED',
        description: newConstraint.description,
    };

    setConstraints(prev => [...prev, newEntry]);
    setIsFormOpen(false);
    // Reset form
    setNewConstraint({
        subjectId: '',
        day: '',
        timeOfDay: '',
        constraintType: 'FORBIDDEN',
        description: '',
    });
  };
  
  const handleDeleteConstraint = (id: string) => {
      setConstraints(prev => prev.filter(c => c.id !== id));
  };

  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || 'Matière inconnue';
  const dayLabels: Record<Day, string> = { MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche' };
  const timeOfDayLabels: Record<string, string> = { MORNING: 'Matin', AFTERNOON: 'Après-midi', ANY: 'Toute la journée' };
  const constraintTypeLabels: Record<string, string> = { FORBIDDEN: 'Interdit', DISCOURAGED: 'Non recommandé' };

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
              <CardTitle>Contraintes par Classe</CardTitle>
              <CardDescription>
                Définissez des règles pour des matières spécifiques au sein d'une classe, par exemple, pour éviter de placer un cours à un moment inopportun.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={classes.length === 0}>
                        <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Sélectionner une classe..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={String(cls.id)}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={!selectedClassId}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une contrainte</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Nouvelle Contrainte de Classe</DialogTitle>
                          <DialogDescription>
                            Pour la classe : {classes.find(c => c.id === parseInt(selectedClassId || '0', 10))?.name || ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Matière</Label>
                                <Select value={newConstraint.subjectId} onValueChange={(value) => setNewConstraint(s => ({...s, subjectId: value}))}>
                                    <SelectTrigger id="subject"><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                                    <SelectContent>{subjects.map(sub => <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="day">Jour</Label>
                                    <Select value={newConstraint.day} onValueChange={(value) => setNewConstraint(s => ({...s, day: value}))}>
                                        <SelectTrigger id="day"><SelectValue placeholder="Choisir un jour" /></SelectTrigger>
                                        <SelectContent>{Object.entries(dayLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Moment</Label>
                                    <Select value={newConstraint.timeOfDay} onValueChange={(value) => setNewConstraint(s => ({...s, timeOfDay: value}))}>
                                        <SelectTrigger id="time"><SelectValue placeholder="Choisir un moment" /></SelectTrigger>
                                        <SelectContent>{Object.entries(timeOfDayLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Type de contrainte</Label>
                                <RadioGroup value={newConstraint.constraintType} onValueChange={(value) => setNewConstraint(s => ({...s, constraintType: value}))} className="flex space-x-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="FORBIDDEN" id="r1" /><Label htmlFor="r1">Interdit</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="DISCOURAGED" id="r2" /><Label htmlFor="r2">Non recommandé</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optionnel)</Label>
                                <Textarea id="description" placeholder="Ex: Les élèves sont moins attentifs à ce moment." value={newConstraint.description} onChange={(e) => setNewConstraint(s => ({...s, description: e.target.value}))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
                            <Button onClick={handleAddConstraint}>Sauvegarder</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-lg p-4 space-y-3 min-h-[10rem]">
                    {filteredConstraints.length > 0 ? filteredConstraints.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="text-sm">
                                <p className="font-semibold">
                                    <span className="text-red-600 font-bold">{getSubjectName(c.subjectId)}</span> est <span className="font-bold">{constraintTypeLabels[c.constraintType]}</span> le <span className="font-bold">{dayLabels[c.day]} {timeOfDayLabels[c.timeOfDay].toLowerCase()}</span>.
                                </p>
                                {c.description && <p className="text-muted-foreground text-xs italic">"{c.description}"</p>}
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteConstraint(c.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full">
                            <p className="text-lg">Aucune contrainte définie pour cette classe.</p>
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher_constraints">
          {/* Placeholder for teacher constraints */}
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Contraintes Enseignant</CardTitle><CardDescription>Fonctionnalité à venir.</CardDescription></CardHeader>
            <CardContent><div className="p-8 text-center text-muted-foreground"><p>Indisponibilités, préférences de salle, etc.</p></div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject_requirements">
          {/* Placeholder for subject requirements */}
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Exigences Matière</CardTitle><CardDescription>Fonctionnalité à venir.</CardDescription></CardHeader>
            <CardContent><div className="p-8 text-center text-muted-foreground"><p>Besoin d'un type de salle spécifique (ex: labo), etc.</p></div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
