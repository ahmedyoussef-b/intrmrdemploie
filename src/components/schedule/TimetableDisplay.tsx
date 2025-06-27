
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
import { format, parseISO, parse } from 'date-fns';
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

const generateTimeSlots = (
    startTimeStr: string,
    endTimeStr: string,
    sessionDuration: number, // in minutes
    lunchStartStr: string,
    lunchEndStr: string
): string[] => {
    const slots: string[] = [];
    if (!startTimeStr || !endTimeStr || !sessionDuration) return [];
    
    const baseDate = new Date(); // Use a consistent date for parsing
    const parseTime = (timeStr: string) => parse(timeStr, 'HH:mm', baseDate);

    let currentSlotStart = parseTime(startTimeStr);
    const schoolEnd = parseTime(endTimeStr);
    const lunchStart = parseTime(lunchStartStr);
    const lunchEnd = parseTime(lunchEndStr);

    while (true) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + sessionDuration * 60 * 1000);

        if (currentSlotEnd > schoolEnd) {
            break;
        }

        const startsDuringLunch = currentSlotStart >= lunchStart && currentSlotStart < lunchEnd;
        const endsDuringLunch = currentSlotEnd > lunchStart && currentSlotEnd <= lunchEnd;
        const wrapsLunch = currentSlotStart < lunchStart && currentSlotEnd > lunchEnd;
        
        if (startsDuringLunch || endsDuringLunch || wrapsLunch) {
            currentSlotStart = new Date(lunchEnd.getTime());
            continue;
        }

        slots.push(format(currentSlotStart, 'HH:mm'));
        currentSlotStart = currentSlotEnd;
    }

    return slots;
};

const TimetableGrid = ({
    lessons,
    wizardData,
    schoolDays,
    timeSlots,
    getSubjectColor,
    isDraggingDeletable,
    filterId, // classId or teacherId
    filterType // 'class' or 'teacher'
}: {
    lessons: LessonWithDetails[];
    wizardData: WizardData;
    schoolDays: string[];
    timeSlots: string[];
    getSubjectColor: (subjectName: string) => string;
    isDraggingDeletable: boolean;
    filterId: number | string;
    filterType: 'class' | 'teacher';
}) => {
    const processedSchedule = useMemo(() => {
        const grid: Record<string, Array<{ time: string; lesson: LessonWithDetails | null; rowSpan: number; isPlaceholder: boolean; }>> = {};

        schoolDays.forEach(day => {
            grid[day] = timeSlots.map(time => ({ time, lesson: null, rowSpan: 1, isPlaceholder: false }));
        });

        const filteredLessons = lessons.filter(l => filterType === 'class' ? l.classId === filterId : l.teacherId === filterId);

        filteredLessons.forEach(lesson => {
            const lessonDay = dayEnumMap[lesson.day];
            if (!lessonDay || !grid[lessonDay]) return;

            const lessonStartTime = format(parseISO(lesson.startTime), 'HH:mm');
            const start_dt = parseISO(lesson.startTime);
            const end_dt = parseISO(lesson.endTime);
            const durationInMinutes = (end_dt.getTime() - start_dt.getTime()) / (1000 * 60);
            const durationInSlots = wizardData.school.sessionDuration > 0 ? Math.round(durationInMinutes / wizardData.school.sessionDuration) : 1;
            
            const startIndex = grid[lessonDay].findIndex(cell => cell.time === lessonStartTime);

            if (startIndex !== -1) {
                grid[lessonDay][startIndex].lesson = lesson;
                grid[lessonDay][startIndex].rowSpan = durationInSlots;
                for (let i = 1; i < durationInSlots; i++) {
                    if (grid[lessonDay][startIndex + i]) {
                        grid[lessonDay][startIndex + i].isPlaceholder = true;
                    }
                }
            }
        });
        return grid;
    }, [lessons, schoolDays, timeSlots, filterId, filterType, wizardData.school.sessionDuration]);


    return (
        <Table className="min-w-full">
            <TableHeader><TableRow><TableHead className="w-20">Horaires</TableHead>{schoolDays.map(day => <TableHead key={day} className="text-center min-w-32">{day}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
                {timeSlots.map((time, timeIndex) => (
                    <TableRow key={time}>
                        <TableCell className="font-medium bg-gray-50 sticky left-0 bg-background z-10">{time}</TableCell>
                        {schoolDays.map(day => {
                            const cellData = processedSchedule[day]?.[timeIndex];
                            if (!cellData || cellData.isPlaceholder) {
                                return null;
                            }

                            const droppableId = `droppable-cell__${filterId}__${day}__${time}`;
                            const { setNodeRef, isOver } = useDroppable({ id: droppableId });

                            return (
                                <TableCell
                                    ref={setNodeRef}
                                    key={`${day}-${time}`}
                                    rowSpan={cellData.rowSpan}
                                    className={cn("p-1 align-top relative", isOver && "bg-blue-100 ring-2 ring-blue-400")}
                                >
                                    {cellData.lesson ? (
                                        <DraggableLessonGridItem lesson={cellData.lesson} getSubjectColor={getSubjectColor} />
                                    ) : (
                                        <div className="p-2 h-20 bg-gray-50 rounded-md border border-dashed border-gray-200"></div>
                                    )}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ lessons, wizardData }) => {
  const [localLessons, setLocalLessons] = useState<LessonWithDetails[]>([]);
  const [isDraggingDeletable, setIsDraggingDeletable] = useState(false);
  const [nextId, setNextId] = useState(-1);
  
  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  const { toast } = useToast();
  const schoolDays = wizardData.school.schoolDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).map(day => {
    const dayMappings: {[key:string]: string} = { Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche' };
    return dayMappings[day] || day;
  });
  
  const timeSlots = useMemo(() => {
    const { school } = wizardData;
    if (!school || !school.startTime || !school.endTime || !school.sessionDuration) {
        return Array.from(new Set(lessons.map(l => format(parseISO(l.startTime), 'HH:mm')))).sort();
    }
    return generateTimeSlots(school.startTime, school.endTime, school.sessionDuration, school.lunchBreakStart, school.lunchBreakEnd);
  }, [wizardData.school, lessons]);


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
          id: nextId,
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
        setNextId(prev => prev - 1);
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
      <div className="space-y-6">
        <Card className="p-6 print:shadow-none print:border-none">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Emplois du Temps - {wizardData.school.name}</h2>
              <p className="text-gray-600">Planification interactive</p>
            </div>
            <div className="flex space-x-3 print-hidden">
              <Button variant="outline" onClick={exportToPDF}><Printer size={16} className="mr-2" />Imprimer / Exporter PDF</Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 print-hidden">
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
                        <SelectTrigger className="w-full md:w-72 print-hidden">
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
                         <Card className="p-6 break-inside-avoid">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle>Emploi du temps - Classe {selectedClass.name}</CardTitle>
                            </CardHeader>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1 flex-col print-hidden">
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
                                   <TimetableGrid
                                        lessons={localLessons}
                                        wizardData={wizardData}
                                        schoolDays={schoolDays}
                                        timeSlots={timeSlots}
                                        getSubjectColor={getSubjectColor}
                                        isDraggingDeletable={isDraggingDeletable}
                                        filterId={selectedClass.id}
                                        filterType="class"
                                   />
                                </div>
                            </div>
                        </Card>
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

          <TabsContent value="teachers" className="space-y-6">
            {wizardData.teachers.map((teacher: TeacherWithDetails) => {
              return (
                <Card key={teacher.id} className="p-6 break-inside-avoid print:shadow-none print:border-b-2 print:break-after-page">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2"><User className="text-green-500" size={20} /><h3 className="text-xl font-semibold">{teacher.name} {teacher.surname}</h3></div>
                    <div className="flex flex-wrap gap-1">{(teacher.subjects || []).map((s: any) => <Badge key={s.id} variant="outline" className="text-xs">{s.name}</Badge>)}</div>
                  </div>
                  <div className="overflow-x-auto">
                    <TimetableGrid
                        lessons={localLessons}
                        wizardData={wizardData}
                        schoolDays={schoolDays}
                        timeSlots={timeSlots}
                        getSubjectColor={getSubjectColor}
                        isDraggingDeletable={isDraggingDeletable}
                        filterId={teacher.id}
                        filterType="teacher"
                    />
                  </div>
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
