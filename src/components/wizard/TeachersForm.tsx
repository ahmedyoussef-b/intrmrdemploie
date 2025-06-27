import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Calendar, Loader2, BookCopy } from 'lucide-react';
import type { TeacherWithDetails, CreateTeacherPayload, Subject } from '@/types';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addProfesseur, deleteProfesseur, assignSubjectsToTeacher } from '@/lib/features/professeurs/professeursSlice';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TeachersFormProps {
  data: TeacherWithDetails[];
  schoolDays: string[];
  allSubjects: Subject[];
}

const TeachersForm: React.FC<TeachersFormProps> = ({ data, schoolDays, allSubjects }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newTeacher, setNewTeacher] = useState<CreateTeacherPayload>({
    email: '',
    username: '',
    name: '',
    surname: '',
    phone: '',
    address: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTeacher = async () => {
    if (isAdding || !newTeacher.name || !newTeacher.surname || !newTeacher.email || !newTeacher.username) return;
    
    setIsAdding(true);
    const result = await dispatch(addProfesseur(newTeacher));
    setIsAdding(false);

    if (addProfesseur.fulfilled.match(result)) {
      toast({
        title: 'Enseignant ajouté',
        description: `Le profil pour ${result.payload.name} ${result.payload.surname} a été créé.`,
      });
      setNewTeacher({ email: '', username: '', name: '', surname: '', phone: '', address: '' });
    } else {
      toast({
        variant: 'destructive',
        title: "Erreur d'ajout",
        description: (result.payload as string) || 'Une erreur est survenue.',
      });
    }
  };

  const handleDeleteTeacher = (id: string) => {
    dispatch(deleteProfesseur(id));
  };
  
  const handleSubjectAssign = (teacher: TeacherWithDetails, subjectId: number, isAssigned: boolean) => {
    const currentSubjectIds = teacher.subjects.map(s => s.id);
    const newSubjectIds = isAssigned
      ? [...currentSubjectIds, subjectId]
      : currentSubjectIds.filter(id => id !== subjectId);
    
    dispatch(assignSubjectsToTeacher({ teacherId: teacher.id, subjectIds: newSubjectIds }))
      .unwrap()
      .then(() => {
        toast({
          title: "Mise à jour réussie",
          description: `Les matières de ${teacher.name} ${teacher.surname} ont été mises à jour.`
        });
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: "Erreur de mise à jour",
          description: error || "Une erreur est survenue lors de l'assignation."
        });
      });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <UserPlus className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Ajouter un enseignant</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Prénom</Label>
              <Input
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                placeholder="Ex: Marie"
                className="mt-1"
                disabled={isAdding}
              />
            </div>
             <div>
              <Label>Nom</Label>
              <Input
                value={newTeacher.surname}
                onChange={(e) => setNewTeacher({...newTeacher, surname: e.target.value})}
                placeholder="Ex: Curie"
                className="mt-1"
                disabled={isAdding}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                placeholder="Ex: m.curie@email.com"
                className="mt-1"
                disabled={isAdding}
              />
            </div>
             <div>
              <Label>Nom d'utilisateur</Label>
              <Input
                value={newTeacher.username}
                onChange={(e) => setNewTeacher({...newTeacher, username: e.target.value})}
                placeholder="Ex: mcurie"
                className="mt-1"
                disabled={isAdding}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Téléphone (Optionnel)</Label>
              <Input
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                className="mt-1"
                disabled={isAdding}
              />
            </div>
             <div>
              <Label>Adresse (Optionnel)</Label>
              <Input
                value={newTeacher.address}
                onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                className="mt-1"
                disabled={isAdding}
              />
            </div>
          </div>

          <Button 
            onClick={handleAddTeacher}
            disabled={isAdding || !newTeacher.name || !newTeacher.surname || !newTeacher.email || !newTeacher.username}
            className="w-full"
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAdding ? 'Ajout en cours...' : "Ajouter l'enseignant"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Enseignants configurés ({data.length})</h3>
          </div>
        </div>
        
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun enseignant configuré</p>
            <p className="text-sm">Commencez par créer un profil personnalisé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((teacher) => (
              <Card key={teacher.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-lg">{teacher.name} {teacher.surname}</h4>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                 <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Matières enseignées:</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.length > 0 ? teacher.subjects.map(subject => (
                          <Badge key={subject.id} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        )) : <span className="text-xs text-gray-500">Aucune matière assignée</span>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2 w-full md:w-auto">
                          <BookCopy className="mr-2 h-4 w-4" />
                          Assigner les Matières
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Sélectionner les matières</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allSubjects.map(subject => (
                          <DropdownMenuCheckboxItem
                            key={subject.id}
                            checked={teacher.subjects.some(s => s.id === subject.id)}
                            onCheckedChange={(checked) => {
                              handleSubjectAssign(teacher, subject.id, checked as boolean)
                            }}
                            onSelect={(e) => e.preventDefault()}
                          >
                            {subject.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {data.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Statistiques enseignants</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
            <div>
              <p className="font-medium">Total enseignants</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
            <div>
              <p className="font-medium">Matières couvertes</p>
              <p className="text-2xl font-bold">
                {new Set(data.flatMap(t => t.subjects.map(s => s.name))).size}
              </p>
            </div>
             <div>
              <p className="font-medium">Profs sans matière</p>
              <p className="text-2xl font-bold">
                {data.filter(t => t.subjects.length === 0).length}
              </p>
            </div>
            <div>
              <p className="font-medium">Postes à pourvoir</p>
              <p className="text-2xl font-bold">
                0
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeachersForm;
