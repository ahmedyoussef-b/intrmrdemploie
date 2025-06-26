import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Subject, Teacher, Class, CreateSubjectPayload } from '@/types';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addMatiere, deleteMatiere } from '@/lib/features/matieres/matieresSlice';
import { useToast } from '@/hooks/use-toast';

interface SubjectsFormProps {
  data: Subject[];
  classes: Class[];
  teachers: Teacher[];
}

const commonSubjects = [
  'Mathématiques', 'Français', 'Histoire-Géographie', 'Sciences Physiques',
  'Sciences de la Vie et de la Terre', 'Anglais', 'Espagnol', 'Allemand',
  'Arts Plastiques', 'Musique', 'EPS', 'Technologie', 'Informatique'
];

const SubjectsForm: React.FC<SubjectsFormProps> = ({ data, classes, teachers }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newSubject, setNewSubject] = useState<CreateSubjectPayload>({
    name: '',
    weeklyHours: 2,
    coefficient: 1,
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubject = async () => {
    if (isAdding || !newSubject.name || !newSubject.weeklyHours || !newSubject.coefficient) return;

    setIsAdding(true);
    const result = await dispatch(addMatiere(newSubject));
    setIsAdding(false);

    if (addMatiere.fulfilled.match(result)) {
      toast({
        title: 'Matière ajoutée',
        description: `La matière "${result.payload.name}" a été créée avec succès.`,
      });
      setNewSubject({ name: '', weeklyHours: 2, coefficient: 1 });
    } else {
      toast({
        variant: 'destructive',
        title: "Erreur d'ajout",
        description: (result.payload as string) || 'Une erreur est survenue.',
      });
    }
  };

  const handleDeleteSubject = (id: number) => {
    dispatch(deleteMatiere(id));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Plus className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Ajouter une matière</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label>Nom de la matière</Label>
              <Select 
                value={newSubject.name} 
                onValueChange={(value) => setNewSubject({...newSubject, name: value})}
                disabled={isAdding}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir une matière" />
                </SelectTrigger>
                <SelectContent>
                  {commonSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Heures par semaine</Label>
              <Input
                type="number"
                value={newSubject.weeklyHours}
                onChange={(e) => setNewSubject({...newSubject, weeklyHours: parseInt(e.target.value) || 0})}
                min="1"
                max="10"
                className="mt-1"
                disabled={isAdding}
              />
            </div>

             <div>
              <Label>Coefficient</Label>
              <Input
                type="number"
                value={newSubject.coefficient}
                onChange={(e) => setNewSubject({...newSubject, coefficient: parseInt(e.target.value) || 0})}
                min="1"
                max="10"
                className="mt-1"
                disabled={isAdding}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddSubject}
            disabled={!newSubject.name || !newSubject.weeklyHours || !newSubject.coefficient || isAdding}
            className="w-full"
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAdding ? 'Ajout en cours...' : 'Ajouter la matière'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Matières configurées ({data.length})</h3>
        </div>
        
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune matière configurée</p>
            <p className="text-sm">Commencez par ajouter votre première matière</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((subject) => (
              <Card key={subject.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{subject.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span>Volume: <strong>{subject.weeklyHours}h/semaine</strong></span>
                      <span>Coefficient: <strong>{subject.coefficient}</strong></span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {data.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Statistiques matières</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
            <div>
              <p className="font-medium">Total matières</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div>
              <p className="font-medium">Volume total</p>
              <p className="text-2xl font-bold">
                {data.reduce((sum, subject) => sum + subject.weeklyHours, 0)}h
              </p>
            </div>
            <div>
              <p className="font-medium">Coeff. moyen</p>
              <p className="text-2xl font-bold">
                {data.length > 0 ? (data.reduce((sum, subject) => sum + (subject.coefficient || 1), 0) / data.length).toFixed(1) : 0}
              </p>
            </div>
             <div>
              <p className="font-medium">Matières &gt; 3h</p>
              <p className="text-2xl font-bold">
                {data.filter(s => s.weeklyHours > 3).length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubjectsForm;
