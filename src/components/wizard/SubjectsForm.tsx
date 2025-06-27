import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, Save } from 'lucide-react';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useToast } from '@/hooks/use-toast';
import { updateMatiere } from '@/lib/features/matieres/matieresSlice';
import type { Subject } from '@/types';

interface SubjectConfigCardProps {
  subject: Subject;
}

const SubjectConfigCard: React.FC<SubjectConfigCardProps> = ({ subject }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localSubjectData, setLocalSubjectData] = useState({
    weeklyHours: subject.weeklyHours,
    coefficient: subject.coefficient || 1, // Default to 1 if null/undefined
  });

  const handleInputChange = (field: 'weeklyHours' | 'coefficient', value: string) => {
    // Allow empty input but treat it as 0 internally for validation, will be parsed to number on save.
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setLocalSubjectData(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (localSubjectData.weeklyHours <= 0) {
      toast({ variant: 'destructive', title: 'Erreur de validation', description: 'Le volume horaire doit être un nombre positif.' });
      return;
    }
    if (localSubjectData.coefficient <= 0) {
      toast({ variant: 'destructive', title: 'Erreur de validation', description: 'Le coefficient doit être un nombre positif.' });
      return;
    }
    
    setIsSaving(true);
    
    const payload: Subject = {
      ...subject,
      weeklyHours: localSubjectData.weeklyHours,
      coefficient: localSubjectData.coefficient,
    };
    
    const result = await dispatch(updateMatiere(payload));
    setIsSaving(false);
    
    if (updateMatiere.fulfilled.match(result)) {
      toast({ title: 'Succès', description: `La matière "${subject.name}" a été mise à jour.` });
    } else {
      toast({ variant: 'destructive', title: 'Erreur de Sauvegarde', description: (result.payload as string) || 'Une erreur est survenue.' });
    }
  };
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h4 className="font-semibold text-lg flex-1">{subject.name}</h4>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex-1">
            <Label htmlFor={`weeklyHours-${subject.id}`} className="text-xs text-muted-foreground">Volume/sem.</Label>
            <Input
              id={`weeklyHours-${subject.id}`}
              type="number"
              value={localSubjectData.weeklyHours}
              onChange={(e) => handleInputChange('weeklyHours', e.target.value)}
              className="mt-1 h-9"
              min="1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`coefficient-${subject.id}`} className="text-xs text-muted-foreground">Coeff.</Label>
            <Input
              id={`coefficient-${subject.id}`}
              type="number"
              value={localSubjectData.coefficient}
              onChange={(e) => handleInputChange('coefficient', e.target.value)}
              className="mt-1 h-9"
              min="1"
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="self-end h-9">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="sr-only">Sauvegarder</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};


interface SubjectsFormProps {
  data: Subject[];
}

const SubjectsForm: React.FC<SubjectsFormProps> = ({ data }) => {
  // Sort data alphabetically
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Configuration des Matières ({data.length})</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Ajustez le volume horaire hebdomadaire et le coefficient de chaque matière. Ces paramètres sont cruciaux pour la génération de l'emploi du temps.
        </p>
        
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune matière configurée</p>
            <p className="text-sm">Veuillez d'abord ajouter des matières via le panneau d'administration si nécessaire.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedData.map((subject) => (
              <SubjectConfigCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SubjectsForm;
