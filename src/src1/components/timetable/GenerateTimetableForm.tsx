
"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react"; // Ensure useActionState is from "react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleGenerateTimetable, type ActionResponse } from "@/actions/timetableActions";
import { Loader2, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { TimetableDisplay } from "./TimetableDisplay";
import { useToast } from "@/hooks/use-toast";
import type { ParsedScheduleData } from "@/types/timetable";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Générer l'Emploi du Temps
    </Button>
  );
}

export function GenerateTimetableForm() {
  const initialState: ActionResponse | undefined = undefined;
  // Ensure useActionState is imported from "react"
  const [state, formAction] = useActionState(handleGenerateTimetable, initialState);
  const [parsedScheduleData, setParsedScheduleData] = useState<ParsedScheduleData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success && state.data?.scheduleData) {
      try {
        const parsed = JSON.parse(state.data.scheduleData) as ParsedScheduleData;
        setParsedScheduleData(parsed);
        toast({
          title: "Emploi du Temps Généré",
          description: state.data.scheduleSummary || "L'emploi du temps a été généré avec succès.",
          variant: "default",
        });
      } catch (error) {
        console.error("Échec de l'analyse des données de l'emploi du temps:", error);
        setParsedScheduleData(null);
        toast({
          title: "Erreur d'Analyse",
          description: "Impossible d'afficher l'emploi du temps généré. Le format des données est invalide.",
          variant: "destructive",
        });
      }
    } else if (state?.success === false && state.message) {
       toast({
          title: "Échec de la Génération",
          description: state.message,
          variant: "destructive",
        });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Générer un Emploi du Temps</CardTitle>
          <CardDescription>
            Entrez l'ID de l'établissement et l'ID de la période pour générer automatiquement un emploi du temps à l'aide de l'IA.
          </CardDescription>
        </CardHeader>
        {/* Pass formAction to the action prop of the form */}
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schoolId" className="text-base">ID Établissement</Label>
              <Input
                id="schoolId"
                name="schoolId"
                type="number"
                placeholder="ex: 1"
                required
                className="text-base"
              />
              {state?.errors?.find(e => e.path.includes("schoolId")) && (
                <p className="text-sm text-destructive">{state.errors.find(e => e.path.includes("schoolId"))?.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="termId" className="text-base">ID Période</Label>
              <Input
                id="termId"
                name="termId"
                type="number"
                placeholder="ex: 1"
                required
                className="text-base"
              />
              {state?.errors?.find(e => e.path.includes("termId")) && (
                <p className="text-sm text-destructive">{state.errors.find(e => e.path.includes("termId"))?.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t pt-6">
             <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {useFormStatus().pending && (
        <Alert className="border-primary/50 text-primary">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-semibold">Traitement...</AlertTitle>
          <AlertDescription>
            L'IA génère l'emploi du temps. Cela peut prendre quelques instants.
          </AlertDescription>
        </Alert>
      )}

      {state?.success === false && state.message && !state.errors && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Erreur</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success && state.data && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              Résultat de la Génération
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Résumé :</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.scheduleSummary}</p>
            </div>
            {parsedScheduleData ? (
              <TimetableDisplay scheduleData={parsedScheduleData} />
            ) : (
              state.data.scheduleData && (
                <div>
                  <h3 className="font-semibold text-lg">Données Brutes de l'Emploi du Temps (JSON) :</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-code">
                    {JSON.stringify(JSON.parse(state.data.scheduleData), null, 2)}
                  </pre>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
