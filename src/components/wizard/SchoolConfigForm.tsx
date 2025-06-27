
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, School } from 'lucide-react';
import type { SchoolData } from '@/types/wizard';

interface SchoolConfigFormProps {
  data: SchoolData;
  onUpdate: (data: SchoolData) => void;
}

const dayOptions = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' }
];

const SchoolConfigForm: React.FC<SchoolConfigFormProps> = ({ data, onUpdate }) => {
  const handleInputChange = (field: keyof SchoolData, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const handleDayToggle = (dayId: string, checked: boolean) => {
    const newDays = checked 
      ? [...data.schoolDays, dayId]
      : data.schoolDays.filter(day => day !== dayId);
    handleInputChange('schoolDays', newDays);
  };

  return (
    <div className="space-y-6">
      {/* School Name */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <School className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Informations de l'établissement</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="schoolName">Nom de l'établissement</Label>
            <Input
              id="schoolName"
              value={data.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Collège Jean Moulin"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Schedule Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Configuration horaire</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Heure de début</Label>
            <Input
              id="startTime"
              type="time"
              value={data.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="endTime">Heure de fin</Label>
            <Input
              id="endTime"
              type="time"
              value={data.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* School Days */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Jours de cours</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dayOptions.map((day) => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={day.id}
                checked={data.schoolDays.includes(day.id)}
                onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
              />
              <Label htmlFor={day.id} className="text-sm font-medium">
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Sélectionnés:</strong> {data.schoolDays.length} jour(s) de cours par semaine
          </p>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Récapitulatif</h3>
        <div className="space-y-2 text-sm text-green-700">
          <p><strong>Établissement:</strong> {data.name || 'Non défini'}</p>
          <p><strong>Horaires:</strong> {data.startTime} - {data.endTime}</p>
          <p><strong>Jours de cours:</strong> {data.schoolDays.length} jour(s)</p>
        </div>
      </Card>
    </div>
  );
};

export default SchoolConfigForm;
