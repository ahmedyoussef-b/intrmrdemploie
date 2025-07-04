
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Download, Calendar, School, Users, BookOpen, MapPin, Clock, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { saveTimetable } from '@/lib/features/timetable/timetableSlice';
import type { WizardData } from '@/types/wizard';
import type { CreateLessonPayload, Classroom, TeacherWithDetails, Subject } from '@/types';
import { Day } from '@prisma/client';
import { format, parse } from 'date-fns';

interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface ValidationStepProps {
  wizardData: WizardData;
  onGenerationSuccess: () => void;
}

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


const ValidationStep: React.FC<ValidationStepProps> = ({ wizardData, onGenerationSuccess }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const validateData = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    if (!wizardData.school.name) results.push({ type: 'error', message: "Le nom de l'établissement est manquant." });
    if (wizardData.classes.length === 0) results.push({ type: 'error', message: 'Aucune classe configurée.' });
    if (wizardData.teachers.length === 0) results.push({ type: 'error', message: 'Aucun enseignant configuré.' });
    if (wizardData.subjects.length === 0) results.push({ type: 'error', message: 'Aucune matière configurée.' });
    if (wizardData.rooms.length === 0) results.push({ type: 'error', message: 'Aucune salle configurée.' });
    
    const unassignedTeachers = wizardData.teachers.filter(t => !t.subjects || t.subjects.length === 0);
    if(unassignedTeachers.length > 0) {
        results.push({ 
            type: 'error', 
            message: `${unassignedTeachers.length} enseignant(s) n'ont aucune matière assignée.`,
            details: unassignedTeachers.map(t => `${t.name} ${t.surname}`).join(', ')
        });
    }

    const unassignedSubjects = wizardData.subjects.filter(s => 
        !wizardData.teachers.some(t => (t.subjects || []).some(ts => ts.id === s.id))
    );
     if(unassignedSubjects.length > 0) {
        results.push({ 
            type: 'warning', 
            message: `${unassignedSubjects.length} matière(s) ne sont enseignées par personne.`,
            details: unassignedSubjects.map(s => s.name).join(', ')
        });
    }

    if (results.filter(r => r.type === 'error').length === 0) {
      results.push({ type: 'success', message: 'Configuration de base valide pour la génération.' });
    }
    
    return results;
  };

  React.useEffect(() => {
    setValidationResults(validateData());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const { classes, subjects, teachers, rooms, school } = wizardData;
    const lessonsToCreate: CreateLessonPayload[] = [];
    const schoolDaysEnum = school.schoolDays.map(d => d.toUpperCase()) as Day[];
    
    const timeSlots = generateTimeSlots(
        school.startTime,
        school.endTime,
        school.sessionDuration,
        school.lunchBreakStart,
        school.lunchBreakEnd
    );
    const sessionDurationMinutes = school.sessionDuration;

    if (timeSlots.length === 0 || !sessionDurationMinutes) {
        toast({
            variant: "destructive",
            title: "Erreur de configuration",
            description: "Paramètres de temps invalides. Vérifiez les heures de début/fin et la durée des séances.",
        });
        setIsGenerating(false);
        return;
    }

    const getSessionsForSubject = (subject: Subject) => {
        const sessions: number[] = [];
        let hours = subject.weeklyHours;

        // Universal logic: Maximize 2-hour blocks for all subjects.
        while (hours >= 2) {
            sessions.push(2);
            hours -= 2;
        }
        
        // Add any remaining single hour.
        if (hours > 0) {
            sessions.push(1);
        }
        
        return sessions;
    };

    const teacherOccupancy: Record<string, boolean> = {}; // Key: "teacherId-day-time"
    const roomOccupancy: Record<string, boolean> = {}; // Key: "roomId-day-time"
    const classOccupancy: Record<string, boolean> = {}; // Key: "classId-day-time"

    let totalSteps = 0;
    
    const allSessionsToPlace: { class: typeof classes[0], subject: Subject, duration: number }[] = [];
    for (const c of classes) {
        for (const subject of subjects) {
            const sessions = getSessionsForSubject(subject);
            for (const duration of sessions) {
                allSessionsToPlace.push({ class: c, subject, duration });
                totalSteps++;
            }
        }
    }
    
    // STRATEGY: Place the hardest-to-fit sessions first (the 2-hour blocks)
    allSessionsToPlace.sort((a, b) => b.duration - a.duration);

    let completedSteps = 0;

    for (const session of allSessionsToPlace) {
        completedSteps++;
        setGenerationProgress((completedSteps / totalSteps) * 100);

        const { class: c, subject, duration: sessionHours } = session;
        let placed = false;
        const attemptBlockSize = sessionHours;
        const shuffledDays = [...schoolDaysEnum].sort(() => Math.random() - 0.5);

        for (const day of shuffledDays) {
            const dailyHoursKey = `${c.id}-${day}-${subject.id}`;
            const hoursAlreadyOnDay = (lessonsToCreate.filter(l => l.classId === c.id && l.day === day && l.subjectId === subject.id).reduce((acc, l) => {
                const start = parse(l.startTime.toISOString().substring(11, 16), 'HH:mm', new Date());
                const end = parse(l.endTime.toISOString().substring(11, 16), 'HH:mm', new Date());
                return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0));

            if (hoursAlreadyOnDay + attemptBlockSize > 2) {
                continue;
            }

            for (let i = 0; i <= timeSlots.length - attemptBlockSize; i++) {
                const startTime = timeSlots[i];
                
                let isClassAvailable = true;
                for (let j = 0; j < attemptBlockSize; j++) {
                    if (classOccupancy[`${c.id}-${day}-${timeSlots[i+j]}`]) {
                        isClassAvailable = false;
                        break;
                    }
                }
                if (!isClassAvailable) continue;

                const potentialTeachers = teachers
                    .filter(t => (t.subjects || []).some(s => s.id === subject.id))
                    .sort(() => Math.random() - 0.5);
                
                let assignedTeacher: TeacherWithDetails | undefined;
                let assignedRoom: Classroom | undefined;
                
                for (const teacher of potentialTeachers) {
                    let isTeacherAvailable = true;
                    for (let j = 0; j < attemptBlockSize; j++) {
                        if (teacherOccupancy[`${teacher.id}-${day}-${timeSlots[i+j]}`]) {
                            isTeacherAvailable = false;
                            break;
                        }
                    }
                    if (!isTeacherAvailable) continue;

                    const potentialRooms = rooms
                        .filter(r => r.capacity >= c.capacity)
                        .sort(() => Math.random() - 0.5);

                    for (const room of potentialRooms) {
                        let isRoomAvailable = true;
                        for (let j = 0; j < attemptBlockSize; j++) {
                            if (roomOccupancy[`${room.id}-${day}-${timeSlots[i+j]}`]) {
                                isRoomAvailable = false;
                                break;
                            }
                        }
                        if (isRoomAvailable) {
                            assignedTeacher = teacher;
                            assignedRoom = room;
                            break;
                        }
                    }
                    if (assignedTeacher) break;
                }

                if (assignedTeacher && assignedRoom) {
                    const [h, m] = startTime.split(':').map(Number);
                    const lessonStartDt = new Date(2024, 0, 1, h, m);
                    const lessonEndDt = new Date(lessonStartDt.getTime() + attemptBlockSize * sessionDurationMinutes * 60000);

                    lessonsToCreate.push({
                        name: `${subject.name} - ${c.abbreviation}`, day,
                        startTime: lessonStartDt, endTime: lessonEndDt,
                        subjectId: subject.id, classId: c.id,
                        teacherId: assignedTeacher.id, classroomId: assignedRoom.id
                    });

                    for (let j = 0; j < attemptBlockSize; j++) {
                        const timeToBook = timeSlots[i+j];
                        classOccupancy[`${c.id}-${day}-${timeToBook}`] = true;
                        teacherOccupancy[`${assignedTeacher.id}-${day}-${timeToBook}`] = true;
                        roomOccupancy[`${assignedRoom.id}-${day}-${timeToBook}`] = true;
                    }

                    placed = true;
                    break; 
                }
            }
            if (placed) break;
        }

        if (!placed) {
            console.warn(`Could not schedule a ${sessionHours}h session of ${subject.name} for class ${c.name}`);
        }
    }


    try {
      await dispatch(saveTimetable(lessonsToCreate)).unwrap();
      setIsGenerated(true);
      toast({ title: "Génération et Sauvegarde Réussies !", description: "L'emploi du temps a été sauvegardé." });
      onGenerationSuccess();
    } catch (error: any) {
      toast({ title: "Erreur de sauvegarde", description: error.message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const getValidationIcon = (type: string) => {
    if (type === 'success') return <CheckCircle className="text-green-500 mt-1" size={20} />;
    if (type === 'warning') return <AlertTriangle className="text-yellow-500 mt-1" size={20} />;
    return <AlertTriangle className="text-red-500 mt-1" size={20} />;
  };

  const canGenerate = validationResults.every(result => result.type !== 'error');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2"><School className="text-blue-500" size={20} /><span>Récapitulatif</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: "Classes", value: wizardData.classes.length, color: 'text-blue-600' },
            { icon: BookOpen, label: "Matières", value: wizardData.subjects.length, color: 'text-green-600' },
            { icon: Calendar, label: "Enseignants", value: wizardData.teachers.length, color: 'text-purple-600' },
            { icon: MapPin, label: "Salles", value: wizardData.rooms.length, color: 'text-orange-600' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <item.icon size={24} className={`mx-auto mb-2 ${item.color}`} />
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2"><CheckCircle className="text-blue-500" size={20} /><span>Validation</span></h3>
        <div className="space-y-3">
          {validationResults.map((result, index) => (
            <Alert key={index} className={`border-l-4 ${result.type === 'success' ? 'border-green-500 bg-green-50' : result.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-start space-x-3">
                {getValidationIcon(result.type)}
                <div>
                  <AlertDescription className="font-medium">{result.message}</AlertDescription>
                  {result.details && <p className="text-xs text-muted-foreground mt-1">{result.details}</p>}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2"><Calendar className="text-blue-500" size={20} /><span>Génération</span></h3>
        {isGenerating ? (
          <div className="space-y-4"><Progress value={generationProgress} className="h-3" /><div className="flex items-center justify-center space-x-2 text-gray-600"><Loader2 size={20} className="animate-spin" /><span>Génération en cours... {Math.round(generationProgress)}%</span></div></div>
        ) : (
          <div className="space-y-4">
            {!canGenerate && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>Veuillez corriger les erreurs de configuration avant de lancer la génération.</AlertDescription></Alert>}
            <div className="flex space-x-4">
              <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className="flex-1" size="lg"><Calendar size={20} className="mr-2" />Générer et Sauvegarder</Button>
            </div>
            {canGenerate && !isGenerated && <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-700">✅ Configuration validée ! La génération peut être lancée.</p></div>}
            {isGenerated && <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-700">🎉 Emplois du temps générés ! Vous pouvez les consulter.</p></div>}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ValidationStep;
