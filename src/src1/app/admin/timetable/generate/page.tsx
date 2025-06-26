
import { GenerateTimetableForm } from "@/components/timetable/GenerateTimetableForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GenerateTimetablePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary font-headline">Génération d'Emploi du Temps par IA</h1>
      <GenerateTimetableForm />
    </div>
  );
}
