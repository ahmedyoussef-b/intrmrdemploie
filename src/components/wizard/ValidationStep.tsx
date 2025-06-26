
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
import type { CreateLessonPayload } from '@/types';
import { Day } from '@prisma/client';

interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface ValidationStepProps {
  wizardData: WizardData;
  onGenerationSuccess: () => void;
}

const ValidationStep: React.FC<ValidationStepProps> = ({ wizardData, onGenerationSuccess }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const validateData = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    if (!wizardData.school.name) results.push({ type: 'error', message: "Nom d'établissement manquant" });
    if (wizardData.classes.length === 0) results.push({ type: 'error', message: 'Aucune classe configurée' });
    if (wizardData.teachers.length === 0) results.push({ type: 'error', message: 'Aucun enseignant configuré' });
    if (wizardData.subjects.length === 0) results.push({ type: 'error', message: 'Aucune matière configurée' });
    if (wizardData.rooms.length === 0) results.push({ type: 'error', message: 'Aucune salle configurée' });
    const totalStudents = wizardData.classes.reduce((sum, cls) => sum + cls.capacity, 0);
    const totalRoomCapacity = wizardData.rooms.reduce((sum, room) => sum + room.capacity, 0);
    if (totalRoomCapacity < totalStudents && wizardData.rooms.length > 0) results.push({ type: 'warning', message: 'Capacité des salles insuffisante' });
    const unassignedSubjects = wizardData.subjects.length > 0 && wizardData.teachers.flatMap(t => t.subjects).length === 0;
    if (unassignedSubjects) results.push({ type: 'warning', message: 'Matières non assignées à des professeurs' });
    if (results.filter(r => r.type === 'error').length === 0) results.push({ type: 'success', message: 'Configuration valide' });
    return results;
  };

  React.useEffect(() => {
    setValidationResults(validateData());
  }, [wizardData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const { classes, subjects, teachers, rooms, school } = wizardData;
    const lessonsToCreate: CreateLessonPayload[] = [];
    const schoolDaysEnum = school.schoolDays.map(d => d.toUpperCase()) as Day[];
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    classes.forEach(c => {
      let dayIndex = 0;
      let timeSlotIndex = 0;
      subjects.forEach((subject, i) => {
        const teacher = teachers[i % teachers.length];
        const room = rooms[i % rooms.length];
        for (let h = 0; h < subject.weeklyHours; h++) {
          const day = schoolDaysEnum[dayIndex % schoolDaysEnum.length];
          const [startHour, startMinute] = timeSlots[timeSlotIndex % timeSlots.length].split(':').map(Number);
          const startTime = new Date(2024, 1, 1, startHour, startMinute);
          const endTime = new Date(startTime.getTime() + school.sessionDuration * 60000);
          lessonsToCreate.push({ name: `${subject.name} - ${c.abbreviation}`, day, startTime, endTime, subjectId: subject.id, classId: c.id, teacherId: teacher.id, classroomId: room.id });
          timeSlotIndex++;
          if (timeSlotIndex >= timeSlots.length) { timeSlotIndex = 0; dayIndex++; }
        }
      });
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    setGenerationProgress(50);

    try {
      await dispatch(saveTimetable(lessonsToCreate)).unwrap();
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(100);
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
    if (type === 'success') return <CheckCircle className="text-green-500" size={20} />;
    if (type === 'warning') return <AlertTriangle className="text-yellow-500" size={20} />;
    return <AlertTriangle className="text-red-500" size={20} />;
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
              <div className="flex items-start space-x-3">{getValidationIcon(result.type)}<AlertDescription>{result.message}</AlertDescription></div>
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
