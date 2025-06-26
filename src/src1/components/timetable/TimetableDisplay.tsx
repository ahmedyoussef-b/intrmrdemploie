
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { JourSemaine } from '@/types'; 
import { cn } from "@/lib/utils";
import type { ParsedScheduleData, TimetableSlot } from "@/types/timetable";

interface TimetableDisplayProps {
  scheduleData: ParsedScheduleData;
}

const ALL_DAYS_ORDERED: JourSemaine[] = [
  JourSemaine.LUNDI,
  JourSemaine.MARDI,
  JourSemaine.MERCREDI,
  JourSemaine.JEUDI,
  JourSemaine.VENDREDI,
  JourSemaine.SAMEDI,
  // JourSemaine.DIMANCHE, // Généralement non planifié
];

// Aide pour obtenir des créneaux horaires uniques et triés
const getUniqueSortedTimeSlots = (slots: TimetableSlot[]): string[] => {
  const timeSet = new Set<string>();
  slots.forEach(slot => {
    timeSet.add(`${slot.startTime} - ${slot.endTime}`);
  });
  return Array.from(timeSet).sort((a, b) => {
    const startTimeA = a.split(' - ')[0];
    const startTimeB = b.split(' - ')[0];
    return startTimeA.localeCompare(startTimeB);
  });
};

export function TimetableDisplay({ scheduleData }: TimetableDisplayProps) {
  if (!scheduleData || !scheduleData.slots || scheduleData.slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Emploi du Temps</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aucune donnée d'emploi du temps disponible à afficher.</p>
          {scheduleData && !scheduleData.slots && <p>La propriété 'slots' est manquante dans scheduleData.</p>}
          {scheduleData && scheduleData.slots && scheduleData.slots.length === 0 && <p>Le tableau 'slots' est vide.</p>}
        </CardContent>
      </Card>
    );
  }

  const { slots, className, teacherName, termName } = scheduleData;

  const relevantDays = ALL_DAYS_ORDERED.filter(day => slots.some((slot: { day: any; }) => slot.day === day));
  const timeIntervals = getUniqueSortedTimeSlots(slots);

  const getSlotDetails = (day: JourSemaine, timeInterval: string): TimetableSlot | undefined => {
    const [startTime, endTime] = timeInterval.split(' - ');
    return slots.find((slot: { day: any; startTime: string; endTime: string; }) => slot.day === day && slot.startTime === startTime && slot.endTime === endTime);
  };
  
  const getSubjectColor = (subjectName: string): string => {
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-red-100 text-red-800 border-red-300",
      "bg-yellow-100 text-yellow-800 border-yellow-300",
      "bg-green-100 text-green-800 border-green-300",
      "bg-blue-100 text-blue-800 border-blue-300",
      "bg-indigo-100 text-indigo-800 border-indigo-300",
      "bg-purple-100 text-purple-800 border-purple-300",
      "bg-pink-100 text-pink-800 border-pink-300",
      "bg-sky-100 text-sky-800 border-sky-300",
      "bg-teal-100 text-teal-800 border-teal-300",
      "bg-orange-100 text-orange-800 border-orange-300",
    ];
    return colors[Math.abs(hash) % colors.length];
  };


  return (
    <Card className="shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          Emploi du Temps
          {className && ` pour la Classe : ${className}`}
          {teacherName && ` pour l'Enseignant : ${teacherName}`}
          {termName && ` (${termName})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-full border-collapse border border-border">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] border border-border p-3 text-sm font-semibold text-muted-foreground sticky left-0 bg-muted/50 z-10">Heure</TableHead>
                {relevantDays.map(day => (
                  <TableHead key={day} className="border border-border p-3 text-center text-sm font-semibold text-muted-foreground capitalize">
                    {day.toLowerCase()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeIntervals.map(interval => (
                <TableRow key={interval} className="hover:bg-muted/20">
                  <TableCell className="font-medium border border-border p-3 text-xs sticky left-0 bg-background z-10 text-muted-foreground">
                    {interval}
                  </TableCell>
                  {relevantDays.map(day => {
                    const slot = getSlotDetails(day, interval);
                    return (
                      <TableCell key={`${day}-${interval}`} className="border border-border p-1 align-top min-w-[150px] h-[100px]">
                        {slot ? (
                          <div className={cn("rounded-md p-2 h-full flex flex-col justify-between text-xs shadow-sm", getSubjectColor(slot.subject))}>
                            <div>
                                <p className="font-bold text-sm truncate">{slot.subject}</p>
                                <p className="truncate">Prof: {slot.teacher || 'N/A'}</p>
                                {slot.class && <p className="truncate">Classe: {slot.class}</p>}
                            </div>
                            {slot.room && <Badge variant="secondary" className="mt-1 self-start text-xs bg-opacity-70 backdrop-blur-sm">{slot.room}</Badge>}
                          </div>
                        ) : (
                          <div className="text-muted-foreground/50 text-center p-2 h-full flex items-center justify-center">-</div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
