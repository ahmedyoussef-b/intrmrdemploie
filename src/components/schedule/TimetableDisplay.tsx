
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Printer, Users, User, GripVertical, BookOpen, FlaskConical, Dumbbell, Globe, Music, Palette, Calculator, Code, Trash2 } from 'lucide-react';
import type { WizardData } from '@/types/wizard';
import type { LessonWithDetails, Subject, ClassWithGrade, Classroom, Day, TeacherWithDetails } from '@/types';
import { format, parseISO } from 'date-fns';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TimetableDisplayProps {
  lessons: LessonWithDetails[];
  wizardData: WizardData;
}

const dayEnumMap: { [key: string]: string } = { MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche' };
const reverseDayEnumMap: { [key: string]: Day } = { 'Lundi': 'MONDAY', 'Mardi': 'TUESDAY', 'Mercredi': 'WEDNESDAY', 'Jeudi': 'THURSDAY', 'Vendredi': 'FRIDAY', 'Samedi': 'SATURDAY', 'Dimanche': 'SUNDAY' };

// Fonction pour obtenir une icône en fonction du nom de la matière
const getSubjectIcon = (subjectName: string): React.ReactNode => {
    const lowerCaseName = subjectName.toLowerCase();
    if (lowerCaseName.includes('math')) return <Calculator className="h-6 w-6 text-purple-500" />;
    if (lowerCaseName.includes('français') || lowerCaseName.includes('histoire')) return <BookOpen className="h-6 w-6 text-blue-500" />;
    if (lowerCaseName.includes('science') || lowerCaseName.includes('physique') || lowerCaseName.includes('chimie') || lowerCaseName.includes('vie')) return <FlaskConical className="h-6 w-6 text-green-500" />;
    if (lowerCaseName.includes('eps') || lowerCaseName.includes('sport')) return <Dumbbell className="h-6 w-6 text-red-500" />;
    if (lowerCaseName.includes('anglais') || lowerCaseName.includes('espagnol') || lowerCaseName.includes('allemand') || lowerCaseName.includes('géo')) return <Globe className="h-6 w-6 text-teal-500" />;
    if (lowerCaseName.includes('musique')) return <Music className="h-6 w-6 text-pink-500" />;
    if (lowerCaseName.includes('art')) return <Palette className="h-6 w-6 text-orange-500" />;
    if (lowerCaseName.includes('techno') || lowerCaseName.includes('info')) return <Code className="h-6 w-6 text-gray-500" />;
    return <BookOpen className="h-6 w-6 text-gray-400" />; // Icône par défaut
}

const DraggableLessonItem = ({ teacher, subject }: { teacher: TeacherWithDetails; subject: Subject }) => {
  const id = `new-lesson__${teacher.id}__${subject.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { teacher, subject, type: 'new-lesson' },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn('mb-2', isDragging && 'opacity-50 z-50 ring-2 ring-primary rounded-lg')}>
      <Card className="p-2 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {getSubjectIcon(subject.name)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm leading-tight">{subject.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{teacher.name} {teacher.surname}</p>
          </div>
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </Card>
    </div>
  );
};

const DraggableLessonGridItem = ({ lesson, getSubjectColor }: { lesson: LessonWithDetails, getSubjectColor: (subjectName: string) => string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `grid-lesson__${lesson.id}`,
    data: { lesson, type: 'grid-lesson' },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn('h-full cursor-grab active:cursor-grabbing', isDragging && 'opacity-50 z-50')}>
      <div className={`p-2 h-full rounded-md border text-xs ${getSubjectColor(lesson.subject?.name ?? '')}`}>
        <div className="font-semibold">{lesson.subject?.name ?? 'Matière Supprimée'}</div>
        <div className="text-xs opacity-75">{lesson.teacher?.name ?? ''} {lesson.teacher?.surname ?? 'Prof. Supprimé'}</div>
        <div className="text-xs opacity-75">Salle {lesson.classroom?.name ?? 'N/A'}</div>
      </div>
    </div>
  );
};


const DroppableTrash = ({ isDraggingDeletable }: { isDraggingDeletable: boolean }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'trash-can',
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'mt-auto pt-4 transition-all duration-300 ease-in-out',
                isDraggingDeletable ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            )}
        >
            <div className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all duration-200',
                isOver ? 'border-red-500 bg-red-100 border-solid shadow-lg' : 'border-muted-foreground/30 bg-muted/20'
            )}>
                <Trash2 className={cn(
                    'h-8 w-8 transition-transform duration-200',
                    isOver ? 'text-red-600 scale-125 -rotate-12' : 'text-muted-foreground'
                )} />
                <p className={cn(
                    'text-center text-sm font-medium transition-colors duration-200',
                    isOver ? 'text-red-700' : 'text-muted-foreground'
                )}>
                    Glisser une leçon ici pour la supprimer
                </p>
            </div>
        </div>
    );
};

const DroppableCell: React.FC<{
  classItem: ClassWithGrade;
  day: string;
  time: string;
  lesson: LessonWithDetails | undefined;
  getSubjectColor: (subjectName: string) => string;
}> = ({ classItem, day, time, lesson, getSubjectColor }) => {
  const droppableId = `droppable-cell__${classItem.id}__${day}__${time}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <TableCell ref={setNodeRef} className={cn("p-1 align-top", isOver && "bg-blue-100 ring-2 ring-blue-400")}>
      {lesson ? (
        <DraggableLessonGridItem lesson={lesson} getSubjectColor={getSubjectColor} />
      ) : (
        <div className="p-2 h-20 bg-gray-50 rounded-md border border-dashed border-gray-200"></div>
      )}
    </TableCell>
  );
};

const ClassTimetable: React.FC<{
  classItem: ClassWithGrade;
  localLessons: LessonWithDetails[];
  wizardData: WizardData;
  timeSlots: string[];
  schoolDays: string[];
  draggableItems: { teacher: TeacherWithDetails; subject: Subject }[];
  getSubjectColor: (subjectName: string) => string;
  isDraggingDeletable: boolean;
}> = ({ classItem, localLessons, wizardData, timeSlots, schoolDays, draggableItems, getSubjectColor, isDraggingDeletable }) => {
  
  const schedule = useMemo(() => localLessons.filter(l => l.classId === classItem.id).reduce((acc, lesson) => {
      const day = dayEnumMap[lesson.day] ?? 'UNKNOWN';
      const time = format(parseISO(lesson.startTime), 'HH:mm');
      if (!acc[day]) acc[day] = {};
      acc[day][time] = lesson;
      return acc;
    }, {} as Record<string, Record<string, LessonWithDetails>>), [localLessons, classItem.id]);

  return (
    <Card className="p-6 break-inside-avoid">
      <CardHeader className="p-0 mb-4">
        <CardTitle>Emploi du temps - Classe {classItem.name}</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 @media print:hidden flex flex-col">
          <div>
            <h4 className="font-semibold mb-3">Matières à placer</h4>
            <ScrollArea className={cn("h-96 rounded-md border p-3", isDraggingDeletable && "pointer-events-none")}>
              {draggableItems.length === 0 && <p className="text-sm text-muted-foreground">Aucun professeur avec une matière assignée n'a été trouvé.</p>}
              {draggableItems.map(({ teacher, subject }) => (
                  <DraggableLessonItem key={`${teacher.id}-${subject.id}`} teacher={teacher} subject={subject} />
              ))}
            </ScrollArea>
          </div>
          <DroppableTrash isDraggingDeletable={isDraggingDeletable} />
        </div>
        <div className="lg:col-span-3 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader><TableRow><TableHead className="w-20">Horaires</TableHead>{schoolDays.map(day => <TableHead key={day} className="text-center min-w-32">{day}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {timeSlots.map(time => (
                <TableRow key={time}>
                  <TableCell className="font-medium bg-gray-50">{time}</TableCell>
                  {schoolDays.map(day => {
                    const lesson = schedule[day]?.[time];
                    return (
                        <DroppableCell 
                            key={`${day}-${time}`}
                            classItem={classItem}
                            day={day}
                            time={time}
                            lesson={lesson}
                            getSubjectColor={getSubjectColor}
                        />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};


const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ lessons, wizardData }) => {
  const [localLessons, setLocalLessons] = useState<LessonWithDetails[]>([]);
  const [isDraggingDeletable, setIsDraggingDeletable] = useState(false);
  
  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const { toast } = useToast();
  const schoolDays = wizardData.school.schoolDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).map(day => {
    const dayMappings: {[key:string]: string} = { Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche' };
    return dayMappings[day] || day;
  });
  
  const timeSlots = Array.from(new Set(localLessons.map(l => format(parseISO(l.startTime), 'HH:mm')))).sort();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(wizardData.classes[0]?.id || null);

  const subjectColors = [
    'bg-blue-100 text-blue-800 border-blue-200', 'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200', 'bg-red-100 text-red-800 border-red-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200', 'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200', 'bg-orange-100 text-orange-800 border-orange-200',
  ];

  const getSubjectColor = (subjectName: string) => {
    const index = wizardData.subjects.findIndex((s: Subject) => s.name === subjectName);
    return subjectColors[index % subjectColors.length];
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'grid-lesson') {
      setIsDraggingDeletable(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDraggingDeletable(false);

    if (!over) return;
    
    const activeType = active.data.current?.type;

    // Handle Deletion
    if (over.id === 'trash-can' && activeType === 'grid-lesson') {
        const lessonToRemove = active.data.current!.lesson as LessonWithDetails;
        setLocalLessons(prev => prev.filter(l => l.id !== lessonToRemove.id));
        toast({
            title: 'Leçon supprimée',
            description: `Le cours de ${lessonToRemove.subject?.name ?? 'N/A'} a été retiré de l'emploi du temps.`,
        });
        return;
    }

    // Handle Adding a new lesson
    if (over.id.toString().startsWith('droppable-cell__') && activeType === 'new-lesson') {
        const { teacher, subject } = active.data.current as { teacher: TeacherWithDetails, subject: Subject, type: string };
        const [_, classIdStr, day, time] = over.id.toString().split('__');
        
        const classId = parseInt(classIdStr, 10);
        const classItem = wizardData.classes.find(c => c.id === classId);
        
        if (!classItem) return;

        const targetDay = reverseDayEnumMap[day];

        const lessonInTargetCell = localLessons.find(l => 
          l.classId === classId &&
          l.day === targetDay &&
          format(parseISO(l.startTime), 'HH:mm') === time
        );

        if (lessonInTargetCell) {
            toast({
                variant: 'destructive',
                title: 'Créneau occupé',
                description: `Cette case est déjà occupée par un cours.`,
            });
            return;
        }

        const teacherConflict = localLessons.find(l => 
          l.teacherId === teacher.id &&
          l.day === targetDay &&
          format(parseISO(l.startTime), 'HH:mm') === time
        );

        if (teacherConflict) {
          toast({
            variant: 'destructive',
            title: 'Conflit de planification',
            description: `${teacher.name} ${teacher.surname} est déjà occupé(e) avec la classe ${teacherConflict.class?.name || 'N/A'}.`,
          });
          return;
        }

        const occupiedRoomIds = localLessons
          .filter(l => l.day === targetDay && format(parseISO(l.startTime), 'HH:mm') === time)
          .map(l => l.classroomId);
          
        const availableRoom = wizardData.rooms.find(r => !occupiedRoomIds.includes(r.id));

        if (!availableRoom) {
           toast({
            variant: 'destructive',
            title: 'Conflit de planification',
            description: `Aucune salle de classe n'est disponible à ce créneau.`,
          });
          return;
        }
        
        const [hour, minute] = time.split(':').map(Number);
        const startTimeDate = new Date(2024, 0, 1, hour, minute);
        const endTimeDate = new Date(startTimeDate.getTime() + wizardData.school.sessionDuration * 60000);

        const newLesson: LessonWithDetails = {
          id: Date.now(), // ID temporaire côté client
          name: `${subject.name} - ${classItem.abbreviation}`,
          day: targetDay,
          startTime: startTimeDate.toISOString(),
          endTime: endTimeDate.toISOString(),
          subjectId: subject.id,
          classId: classId,
          teacherId: teacher.id,
          classroomId: availableRoom.id,
          subject: subject,
          teacher: teacher,
          class: classItem,
          classroom: availableRoom,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setLocalLessons(prevLessons => [...prevLessons, newLesson]);

        toast({
            title: 'Leçon ajoutée !',
            description: `${subject.name} avec ${teacher.name} ${teacher.surname} a été planifié.`,
        });
    }
  };

  const exportToPDF = () => window.print();

  const draggableItems = useMemo(() => {
    const items: { teacher: TeacherWithDetails; subject: Subject }[] = [];
    wizardData.teachers.forEach(teacher => {
      (teacher.subjects || []).forEach(subject => {
          items.push({ teacher, subject });
      });
    });
    return items.sort((a, b) => {
      const subjectA = a.subject.name.toLowerCase();
      const subjectB = b.subject.name.toLowerCase();
      const teacherA = a.teacher.surname.toLowerCase();
      const teacherB = b.teacher.surname.toLowerCase();
  
      if (subjectA < subjectB) return -1;
      if (subjectA > subjectB) return 1;
      if (teacherA < teacherB) return -1;
      if (teacherA > teacherB) return 1;
      return 0;
    });
  }, [wizardData.teachers]);

  const selectedClass = useMemo(() => wizardData.classes.find(c => c.id === selectedClassId), [selectedClassId, wizardData.classes]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6 @media print:space-y-2">
        <Card className="p-6 @media print:shadow-none @media print:border-none">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Emplois du Temps - {wizardData.school.name}</h2>
              <p className="text-gray-600">Planification interactive</p>
            </div>
            <div className="flex space-x-3 @media print:hidden">
              <Button variant="outline" onClick={exportToPDF}><Printer size={16} className="mr-2" />Imprimer</Button>
              <Button variant="outline"><Download size={16} className="mr-2" />Export PDF</Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 @media print:hidden">
            <TabsTrigger value="classes" className="flex items-center space-x-2"><Users size={16} /><span>Par Classes</span></TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center space-x-2"><User size={16} /><span>Par Professeurs</span></TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            {wizardData.classes.length > 0 ? (
                <div className="space-y-4">
                    <Select
                        value={selectedClassId ? String(selectedClassId) : ''}
                        onValueChange={(value) => setSelectedClassId(value ? Number(value) : null)}
                    >
                        <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Sélectionner une classe" />
                        </SelectTrigger>
                        <SelectContent>
                            {wizardData.classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={String(classItem.id)}>
                                    Classe {classItem.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {selectedClass ? (
                        <ClassTimetable
                            classItem={selectedClass}
                            localLessons={localLessons}
                            wizardData={wizardData}
                            timeSlots={timeSlots}
                            schoolDays={schoolDays}
                            draggableItems={draggableItems}
                            getSubjectColor={getSubjectColor}
                            isDraggingDeletable={isDraggingDeletable}
                        />
                    ) : (
                        <Card className="p-6 text-center text-muted-foreground">Veuillez sélectionner une classe pour afficher son emploi du temps.</Card>
                    )}
                </div>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                Aucune classe à afficher. Veuillez en ajouter à l'étape "Niveaux & Classes".
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6 @media print:space-y-2">
            {wizardData.teachers.map((teacher: TeacherWithDetails) => {
               const schedule = localLessons.filter(l => l.teacherId === teacher.id).reduce((acc, lesson) => {
                const day = dayEnumMap[lesson.day];
                const time = format(parseISO(lesson.startTime), 'HH:mm');
                if (!acc[day]) acc[day] = {};
                acc[day][time] = lesson;
                return acc;
              }, {} as Record<string, Record<string, LessonWithDetails>>);

              return (
                <Card key={teacher.id} className="p-6 break-inside-avoid @media print:shadow-none @media print:border-b-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2"><User className="text-green-500" size={20} /><h3 className="text-xl font-semibold">{teacher.name} {teacher.surname}</h3></div>
                    <div className="flex flex-wrap gap-1">{(teacher.subjects || []).map((s: any) => <Badge key={s.id} variant="outline" className="text-xs">{s.name}</Badge>)}</div>
                  </div>
                  <div className="overflow-x-auto"><Table className="min-w-full">
                    <TableHeader><TableRow><TableHead className="w-20">Horaires</TableHead>{schoolDays.map(day => <TableHead key={day} className="text-center min-w-32">{day}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>
                      {timeSlots.map(time => (
                        <TableRow key={time}>
                          <TableCell className="font-medium bg-gray-50">{time}</TableCell>
                          {schoolDays.map(day => {
                            const lesson = schedule[day]?.[time];
                            return (
                              <TableCell key={`${day}-${time}`} className="p-1">
                                {lesson ? (
                                  <div className={`p-2 rounded-md border text-xs ${getSubjectColor(lesson.subject?.name || '')}`}>
                                    <div className="font-semibold">{lesson.subject?.name || 'Matière Supprimée'}</div>
                                    <div className="text-xs opacity-75">Classe {lesson.class?.name || 'N/A'}</div>
                                    <div className="text-xs opacity-75">Salle {lesson.classroom?.name || 'N/A'}</div>
                                  </div>
                                ) : <div className="p-2 h-16 bg-gray-50 rounded-md border border-dashed border-gray-200"></div>}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table></div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </DndContext>
  );
};

export default TimetableDisplay;
