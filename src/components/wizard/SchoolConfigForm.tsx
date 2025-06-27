
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, School, Coffee } from 'lucide-react';
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
          <h3 className="text-lg font-semibold">Horaires de la Journée</h3>
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

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Coffee className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Paramètres des Séances</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sessionDuration">Durée d'une séance</Label>
            <Select
              value={data.sessionDuration.toString()}
              onValueChange={(value) => handleInputChange('sessionDuration', parseInt(value))}
            >
              <SelectTrigger id="sessionDuration" className="mt-1">
                <SelectValue placeholder="Durée..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="55">55 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lunchBreakStart">Début Pause Déjeuner</Label>
            <Input
              id="lunchBreakStart"
              type="time"
              value={data.lunchBreakStart}
              onChange={(e) => handleInputChange('lunchBreakStart', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lunchBreakEnd">Fin Pause Déjeuner</Label>
            <Input
              id="lunchBreakEnd"
              type="time"
              value={data.lunchBreakEnd}
              onChange={(e) => handleInputChange('lunchBreakEnd', e.target.value)}
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
          <p><strong>Durée des séances:</strong> {data.sessionDuration} minutes</p>
          <p><strong>Pause déjeuner:</strong> {data.lunchBreakStart} - {data.lunchBreakEnd}</p>
        </div>
      </Card>
    </div>
  );
};

export default SchoolConfigForm;
