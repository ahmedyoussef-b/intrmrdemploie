
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Puzzle, Trash2, Clock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { fetchClasses, selectAllClasses } from '@/lib/features/classes/classesSlice';
import { fetchMatieres, selectAllMatieres } from '@/lib/features/matieres/matieresSlice';
import { fetchProfesseurs, selectAllProfesseurs } from '@/lib/features/professeurs/professeursSlice';
import type { ClassWithGrade, Subject, TeacherWithDetails } from '@/types';
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

// New constraint structure for teachers
interface TeacherConstraint {
  id: string;
  teacherId: string;
  day: Day;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'UNAVAILABLE';
  description: string;
}

export default function ManageConstraintsPage() {
  const dispatch = useAppDispatch();
  const classes = useAppSelector(selectAllClasses);
  const subjects = useAppSelector(selectAllMatieres);
  const teachers = useAppSelector(selectAllProfesseurs);
  
  // State for Class Constraints
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [classConstraints, setClassConstraints] = useState<ClassConstraint[]>([
      {
          id: '1',
          classId: 3, 
          subjectId: 1, 
          day: 'MONDAY',
          timeOfDay: 'AFTERNOON',
          constraintType: 'DISCOURAGED',
          description: 'Pas de Maths le lundi après-midi pour la 6ème Z, les élèves sont moins attentifs.',
      },
  ]);
  const [newClassConstraint, setNewClassConstraint] = useState({
      subjectId: '',
      day: '',
      timeOfDay: '',
      constraintType: 'FORBIDDEN' as 'FORBIDDEN' | 'DISCOURAGED',
      description: '',
  });

  // New State for Teacher Constraints
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [teacherConstraints, setTeacherConstraints] = useState<TeacherConstraint[]>([]);
  const [newTeacherConstraint, setNewTeacherConstraint] = useState({
      day: '',
      startTime: '',
      endTime: '',
      description: '',
  });


  // Fetch all necessary data
  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchMatieres());
    dispatch(fetchProfesseurs());
  }, [dispatch]);

  // Set default selection for classes
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
        const mockClass = classes.find(c => c.id === 3);
        setSelectedClassId(String(mockClass ? mockClass.id : classes[0].id));
    }
  }, [classes, selectedClassId]);

  // Set default selection for teachers and add a mock constraint
  useEffect(() => {
    if (teachers.length > 0 && !selectedTeacherId) {
        const firstTeacherId = teachers[0].id;
        setSelectedTeacherId(firstTeacherId);
        // Add a mock constraint for demo purposes when teachers load
        if (teacherConstraints.length === 0) {
            setTeacherConstraints([
                {
                    id: 't1',
                    teacherId: firstTeacherId,
                    day: 'TUESDAY',
                    startTime: '14:00',
                    endTime: '16:00',
                    type: 'UNAVAILABLE',
                    description: 'Rendez-vous médical régulier.',
                }
            ]);
        }
    }
  }, [teachers, selectedTeacherId, teacherConstraints.length]);

  // Filtered constraints for selected class
  const filteredClassConstraints = useMemo(() => {
    if (!selectedClassId) return [];
    return classConstraints.filter(c => c.classId === parseInt(selectedClassId, 10));
  }, [classConstraints, selectedClassId]);

  // Filtered constraints for selected teacher
  const filteredTeacherConstraints = useMemo(() => {
    if (!selectedTeacherId) return [];
    return teacherConstraints.filter(c => c.teacherId === selectedTeacherId);
  }, [teacherConstraints, selectedTeacherId]);
  
  // Handlers for Class Constraints
  const handleAddClassConstraint = () => {
    if (!selectedClassId || !newClassConstraint.subjectId || !newClassConstraint.day || !newClassConstraint.timeOfDay) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }
    const newEntry: ClassConstraint = {
        id: Date.now().toString(),
        classId: parseInt(selectedClassId, 10),
        subjectId: parseInt(newClassConstraint.subjectId, 10),
        day: newClassConstraint.day as Day,
        timeOfDay: newClassConstraint.timeOfDay as 'MORNING' | 'AFTERNOON' | 'ANY',
        constraintType: newClassConstraint.constraintType as 'FORBIDDEN' | 'DISCOURAGED',
        description: newClassConstraint.description,
    };
    setClassConstraints(prev => [...prev, newEntry]);
    setIsClassFormOpen(false);
    setNewClassConstraint({ subjectId: '', day: '', timeOfDay: '', constraintType: 'FORBIDDEN', description: '' });
  };
  const handleDeleteClassConstraint = (id: string) => {
      setClassConstraints(prev => prev.filter(c => c.id !== id));
  };
  
  // Handlers for Teacher Constraints
  const handleAddTeacherConstraint = () => {
    if (!selectedTeacherId || !newTeacherConstraint.day || !newTeacherConstraint.startTime || !newTeacherConstraint.endTime) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const newEntry: TeacherConstraint = {
      id: Date.now().toString(),
      teacherId: selectedTeacherId,
      day: newTeacherConstraint.day as Day,
      startTime: newTeacherConstraint.startTime,
      endTime: newTeacherConstraint.endTime,
      type: 'UNAVAILABLE',
      description: newTeacherConstraint.description,
    };
    setTeacherConstraints(prev => [...prev, newEntry]);
    setIsTeacherFormOpen(false);
    setNewTeacherConstraint({ day: '', startTime: '', endTime: '', description: '' });
  };
  const handleDeleteTeacherConstraint = (id: string) => {
      setTeacherConstraints(prev => prev.filter(c => c.id !== id));
  };


  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || 'Matière inconnue';
  const dayLabels: Record<Day, string> = { MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche' };
  const timeOfDayLabels: Record<string, string> = { MORNING: 'Matin', AFTERNOON: 'Après-midi', ANY: 'Toute la journée' };
  const classConstraintTypeLabels: Record<string, string> = { FORBIDDEN: 'Interdit', DISCOURAGED: 'Non recommandé' };

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
                    <Dialog open={isClassFormOpen} onOpenChange={setIsClassFormOpen}>
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
                                <Select value={newClassConstraint.subjectId} onValueChange={(value) => setNewClassConstraint(s => ({...s, subjectId: value}))}>
                                    <SelectTrigger id="subject"><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                                    <SelectContent>{subjects.map(sub => <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="day">Jour</Label>
                                    <Select value={newClassConstraint.day} onValueChange={(value) => setNewClassConstraint(s => ({...s, day: value}))}>
                                        <SelectTrigger id="day"><SelectValue placeholder="Choisir un jour" /></SelectTrigger>
                                        <SelectContent>{Object.entries(dayLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Moment</Label>
                                    <Select value={newClassConstraint.timeOfDay} onValueChange={(value) => setNewClassConstraint(s => ({...s, timeOfDay: value}))}>
                                        <SelectTrigger id="time"><SelectValue placeholder="Choisir un moment" /></SelectTrigger>
                                        <SelectContent>{Object.entries(timeOfDayLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Type de contrainte</Label>
                                <RadioGroup value={newClassConstraint.constraintType} onValueChange={(value) => setNewClassConstraint(s => ({...s, constraintType: value as 'FORBIDDEN' | 'DISCOURAGED'}))} className="flex space-x-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="FORBIDDEN" id="r1" /><Label htmlFor="r1">Interdit</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="DISCOURAGED" id="r2" /><Label htmlFor="r2">Non recommandé</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optionnel)</Label>
                                <Textarea id="description" placeholder="Ex: Les élèves sont moins attentifs à ce moment." value={newClassConstraint.description} onChange={(e) => setNewClassConstraint(s => ({...s, description: e.target.value}))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsClassFormOpen(false)}>Annuler</Button>
                            <Button onClick={handleAddClassConstraint}>Sauvegarder</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-lg p-4 space-y-3 min-h-[10rem]">
                    {filteredClassConstraints.length > 0 ? filteredClassConstraints.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="text-sm">
                                <p className="font-semibold">
                                    <span className="text-red-600 font-bold">{getSubjectName(c.subjectId)}</span> est <span className="font-bold">{classConstraintTypeLabels[c.constraintType]}</span> le <span className="font-bold">{dayLabels[c.day]} {timeOfDayLabels[c.timeOfDay].toLowerCase()}</span>.
                                </p>
                                {c.description && <p className="text-muted-foreground text-xs italic">"{c.description}"</p>}
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClassConstraint(c.id)}>
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contraintes par Enseignant</CardTitle>
              <CardDescription>
                Définissez les périodes d'indisponibilité pour chaque enseignant afin d'éviter les conflits de planification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} disabled={teachers.length === 0}>
                        <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Sélectionner un enseignant..." />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name} {teacher.surname}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isTeacherFormOpen} onOpenChange={setIsTeacherFormOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={!selectedTeacherId}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une indisponibilité</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Nouvelle Indisponibilité</DialogTitle>
                          <DialogDescription>
                            Pour : {teachers.find(t => t.id === selectedTeacherId)?.name || ''} {teachers.find(t => t.id === selectedTeacherId)?.surname || ''}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                           <div className="space-y-2">
                                <Label htmlFor="teacher-day">Jour</Label>
                                <Select value={newTeacherConstraint.day} onValueChange={(value) => setNewTeacherConstraint(s => ({...s, day: value}))}>
                                    <SelectTrigger id="teacher-day"><SelectValue placeholder="Choisir un jour" /></SelectTrigger>
                                    <SelectContent>{Object.entries(dayLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Heure de début</Label>
                                    <Input id="start-time" type="time" value={newTeacherConstraint.startTime} onChange={(e) => setNewTeacherConstraint(s => ({...s, startTime: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-time">Heure de fin</Label>
                                    <Input id="end-time" type="time" value={newTeacherConstraint.endTime} onChange={(e) => setNewTeacherConstraint(s => ({...s, endTime: e.target.value}))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teacher-description">Raison (Optionnel)</Label>
                                <Textarea id="teacher-description" placeholder="Ex: Rendez-vous médical" value={newTeacherConstraint.description} onChange={(e) => setNewTeacherConstraint(s => ({...s, description: e.target.value}))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTeacherFormOpen(false)}>Annuler</Button>
                            <Button onClick={handleAddTeacherConstraint}>Sauvegarder</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-lg p-4 space-y-3 min-h-[10rem]">
                    {filteredTeacherConstraints.length > 0 ? filteredTeacherConstraints.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="text-sm">
                                <p className="font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-600" />
                                    Indisponible le <span className="font-bold">{dayLabels[c.day]}</span> de <span className="font-bold">{c.startTime}</span> à <span className="font-bold">{c.endTime}</span>.
                                </p>
                                {c.description && <p className="text-muted-foreground text-xs italic pl-6">"{c.description}"</p>}
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTeacherConstraint(c.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full">
                            <User className="mr-2 h-6 w-6" />
                            <p className="text-lg">Aucune indisponibilité définie pour cet enseignant.</p>
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject_requirements">
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Exigences Matière</CardTitle><CardDescription>Fonctionnalité à venir.</CardDescription></CardHeader>
            <CardContent><div className="p-8 text-center text-muted-foreground"><p>Besoin d'un type de salle spécifique (ex: labo), etc.</p></div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
