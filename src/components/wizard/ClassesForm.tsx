import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import type { ClassWithGrade, CreateClassPayload } from '@/types';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addClasse, deleteClasse } from '@/lib/features/classes/classesSlice';
import { useToast } from '@/hooks/use-toast';

interface ClassesFormProps {
  data: ClassWithGrade[];
}

const levelOptions = [
  { id: 1, name: 'CP' },
  { id: 2, name: 'CE1' },
  { id: 3, name: 'CE2' },
  { id: 4, name: 'CM1' },
  { id: 5, name: 'CM2' },
  { id: 6, name: '6ème' },
];

const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

const ClassesForm: React.FC<ClassesFormProps> = ({ data }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newClass, setNewClass] = useState({
    gradeId: 0,
    section: '',
    capacity: 25,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddClass = async () => {
    if (isAdding || !newClass.gradeId || !newClass.section || !newClass.capacity) return;

    const selectedGrade = levelOptions.find(l => l.id === newClass.gradeId);
    if (!selectedGrade) return;

    const classToAdd: CreateClassPayload = {
      name: `${selectedGrade.name} ${newClass.section}`,
      abbreviation: `${selectedGrade.name.replace(/\s+/g, '')}${newClass.section}`,
      capacity: newClass.capacity,
      gradeId: newClass.gradeId,
    };
    
    setIsAdding(true);
    const result = await dispatch(addClasse(classToAdd));
    setIsAdding(false);

    if (addClasse.fulfilled.match(result)) {
      toast({
        title: 'Classe ajoutée',
        description: `La classe "${result.payload.name}" a été créée avec succès.`,
      });
      setNewClass({ gradeId: 0, section: '', capacity: 25 });
    } else {
      toast({
        variant: 'destructive',
        title: "Erreur d'ajout",
        description: (result.payload as string) || 'Une erreur est survenue.',
      });
    }
  };

  const handleDeleteClass = (id: number) => {
    dispatch(deleteClasse(id));
  };

  const handleEditClass = (id: number) => {
    setEditingId(id);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Plus className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Ajouter une classe</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Niveau</Label>
            <Select 
              value={newClass.gradeId ? String(newClass.gradeId) : ''}
              onValueChange={(value) => setNewClass({...newClass, gradeId: parseInt(value, 10)})}
              disabled={isAdding}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map(level => (
                  <SelectItem key={level.id} value={String(level.id)}>{level.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Section</Label>
            <Select 
              value={newClass.section} 
              onValueChange={(value) => setNewClass({...newClass, section: value})}
              disabled={isAdding}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Nombre d'élèves</Label>
            <Input
              type="number"
              value={newClass.capacity}
              onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value) || 0})}
              min="1"
              max="40"
              className="mt-1"
              disabled={isAdding}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleAddClass}
              disabled={!newClass.gradeId || !newClass.section || !newClass.capacity || isAdding}
              className="w-full"
            >
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAdding ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Classes configurées ({data.length})</h3>
        </div>
        
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune classe configurée</p>
            <p className="text-sm">Commencez par ajouter votre première classe</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((cls) => (
              <Card key={cls.id} className="p-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{cls.name}</h4>
                      <p className="text-sm text-gray-600">
                        {cls.capacity} élèves
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClass(cls.id)}
                        disabled // Disabled until edit functionality is fully implemented
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Niveau: {cls.grade?.name || 'N/A'}</span>
                    <span>Section: {cls.abbreviation}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {data.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
            <div>
              <p className="font-medium">Total classes</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div>
              <p className="font-medium">Total élèves</p>
              <p className="text-2xl font-bold">
                {data.reduce((sum, cls) => sum + cls.capacity, 0)}
              </p>
            </div>
            <div>
              <p className="font-medium">Niveaux différents</p>
              <p className="text-2xl font-bold">
                {new Set(data.map(cls => cls.grade?.name)).size}
              </p>
            </div>
            <div>
              <p className="font-medium">Effectif moyen</p>
              <p className="text-2xl font-bold">
                {data.length > 0 ? Math.round(data.reduce((sum, cls) => sum + cls.capacity, 0) / data.length) : 0}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassesForm;
