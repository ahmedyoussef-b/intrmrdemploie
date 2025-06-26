
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, School, Users, BookOpen, Calendar, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SchoolConfigForm from '@/components/wizard/SchoolConfigForm';
import ClassesForm from '@/components/wizard/ClassesForm';
import SubjectsForm from '@/components/wizard/SubjectsForm';
import TeachersForm from '@/components/wizard/TeachersForm';
import RoomsForm from '@/components/wizard/RoomsForm';
import ValidationStep from '@/components/wizard/ValidationStep';
import TimetableDisplay from '@/components/schedule/TimetableDisplay';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { fetchClasses, selectAllClasses } from '@/lib/features/classes/classesSlice';
import { fetchMatieres, selectAllMatieres } from '@/lib/features/matieres/matieresSlice';
import { fetchProfesseurs, selectAllProfesseurs } from '@/lib/features/professeurs/professeursSlice';
import { fetchSalles, selectAllSalles } from '@/lib/features/salles/sallesSlice';
import { fetchTimetable, selectAllLessons, getTimetableStatus } from '@/lib/features/timetable/timetableSlice';
import type { SchoolData, WizardData } from '@/types/wizard';

const steps = [
  { id: 'school', title: 'Configuration Établissement', icon: School, description: 'Paramètres généraux de votre établissement' },
  { id: 'classes', title: 'Niveaux & Classes', icon: Users, description: 'Définition des classes et effectifs' },
  { id: 'subjects', title: 'Matières & Horaires', icon: BookOpen, description: 'Configuration des matières et volumes horaires' },
  { id: 'teachers', title: 'Professeurs', icon: Calendar, description: 'Gestion des enseignants et disponibilités' },
  { id: 'rooms', title: 'Salles de Classe', icon: MapPin, description: 'Déclaration des espaces et équipements' },
  { id: 'validation', title: 'Validation & Génération', icon: CheckCircle, description: 'Vérification et génération des emplois du temps' }
];

export default function Home() {
    const [currentStep, setCurrentStep] = useState(0);
    const [view, setView] = useState<'loading' | 'wizard' | 'timetable'>('loading');
    const dispatch = useAppDispatch();

    // Fetch all data on component mount
    useEffect(() => {
      dispatch(fetchClasses());
      dispatch(fetchMatieres());
      dispatch(fetchProfesseurs());
      dispatch(fetchSalles());
      dispatch(fetchTimetable());
    }, [dispatch]);

    // Select data from Redux store
    const classes = useAppSelector(selectAllClasses);
    const subjects = useAppSelector(selectAllMatieres);
    const teachers = useAppSelector(selectAllProfesseurs);
    const rooms = useAppSelector(selectAllSalles);
    const lessons = useAppSelector(selectAllLessons);
    const timetableStatus = useAppSelector(getTimetableStatus);

    useEffect(() => {
        if (timetableStatus !== 'loading' && timetableStatus !== 'idle') {
            if (lessons.length > 0) {
                setView('timetable');
            } else {
                setView('wizard');
            }
        }
    }, [lessons, timetableStatus]);


    const [schoolConfig, setSchoolConfig] = useState<SchoolData>({
      name: 'Collège Jean Moulin',
      startTime: '08:00',
      endTime: '17:00',
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      sessionDuration: 60
    });
  
    const wizardData: WizardData = {
      school: schoolConfig,
      classes: classes,
      subjects: subjects,
      teachers: teachers,
      rooms: rooms,
    };
  
    const progress = ((currentStep + 1) / steps.length) * 100;
  
    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    };
  
    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };
  
    const handleStepClick = (stepIndex: number) => {
      setCurrentStep(stepIndex);
    };

    const handleGenerationSuccess = () => {
        setView('timetable');
    };
  
    const renderStepContent = () => {
      switch (steps[currentStep].id) {
        case 'school':
          return <SchoolConfigForm data={schoolConfig} onUpdate={setSchoolConfig} />;
        case 'classes':
          return <ClassesForm data={classes} />;
        case 'subjects':
          return <SubjectsForm data={subjects} classes={classes} teachers={teachers} />;
        case 'teachers':
          return <TeachersForm data={teachers} schoolDays={schoolConfig.schoolDays} />;
        case 'rooms':
          return <RoomsForm data={rooms} />;
        case 'validation':
          return <ValidationStep wizardData={wizardData} onGenerationSuccess={handleGenerationSuccess} />;
        default:
          return null;
      }
    };
  
    if (view === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (view === 'timetable') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
                <div className="container mx-auto px-4">
                     <TimetableDisplay lessons={lessons} wizardData={wizardData} />
                     <div className="text-center mt-8">
                        <Button size="lg" onClick={() => setView('wizard')}>
                            <Calendar className="mr-2" />
                            Modifier ou Régénérer l'emploi du temps
                        </Button>
                     </div>
                </div>
            </div>
        )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Générateur d'Emplois du Temps</h1>
            <p className="text-lg text-gray-600">Assistant intelligent pour la planification scolaire</p>
          </div>
  
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Étape {currentStep + 1} sur {steps.length}</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
  
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <Card
                    key={step.id}
                    className={cn("p-4 cursor-pointer transition-all duration-300 hover:shadow-md", isActive && "border-blue-500 bg-blue-50", isCompleted && "border-green-500 bg-green-50")}
                    onClick={() => handleStepClick(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full", isActive && "bg-blue-500 text-white", isCompleted && "bg-green-500 text-white", !isActive && !isCompleted && "bg-gray-200 text-gray-600")}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <h3 className={cn("font-medium", isActive && "text-blue-700", isCompleted && "text-green-700")}>{step.title}</h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
  
            <div className="flex-1">
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
                  <p className="text-gray-600">{steps[currentStep].description}</p>
                </div>
  
                <div className="mb-8">{renderStepContent()}</div>
  
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="flex items-center space-x-2"><ChevronLeft size={16} /><span>Précédent</span></Button>
                  <Button onClick={handleNext} disabled={currentStep === steps.length - 1} className="flex items-center space-x-2"><span>Suivant</span><ChevronRight size={16} /></Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
}
