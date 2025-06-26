
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; 
import type { Periode, AnneeScolaire } from "@/types";
// Removed mockData import to avoid top-level execution dependency in client component
import { handleAddTerm, type TermActionResponse } from "@/actions/termActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const termFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  anneeScolaireId: z.string().min(1, "Veuillez sélectionner une année scolaire."),
  dateDebut: z.date({ required_error: "La date de début est requise." }),
  dateFin: z.date({ required_error: "La date de fin est requise." }),
}).refine(data => data.dateFin > data.dateDebut, {
  message: "La date de fin doit être postérieure à la date de début.",
  path: ["dateFin"],
});

type TermFormValues = z.infer<typeof termFormSchema>;

interface TermFormProps {
  initialData?: Periode | null;
  anneesScolaires: AnneeScolaire[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TermForm({ initialData, anneesScolaires, onSuccess, onCancel }: TermFormProps) {
  const form = useForm<TermFormValues>({
    resolver: zodResolver(termFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        dateDebut: new Date(initialData.dateDebut),
        dateFin: new Date(initialData.dateFin),
    } : {
      nom: "",
      anneeScolaireId: anneesScolaires.length > 0 ? anneesScolaires[0].id : "",
      dateDebut: undefined,
      dateFin: undefined,
    },
  });

  const { toast } = useToast();
  const actionToCall = handleAddTerm; // Placeholder for edit
  const [state, formAction, isPending] = useActionState<TermActionResponse | undefined, FormData>(actionToCall, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    } else if (state?.success === false && state.message) {
      toast({
        title: "Erreur",
        description: state.message,
        variant: "destructive",
      });
      // Set form errors from Zod issues
      state.errors?.forEach(err => {
        form.setError(err.path.join(".") as keyof TermFormValues, { type: "manual", message: err.message });
      });
    }
  }, [state, onSuccess, toast, form]);

  function onSubmit(data: TermFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('anneeScolaireId', data.anneeScolaireId);
    formData.append('dateDebut', data.dateDebut.toISOString());
    formData.append('dateFin', data.dateFin.toISOString());
    
    startTransition(() => {
      formAction(formData);
    });
  }

  const selectedAnneeScolaireId = form.watch("anneeScolaireId");
  const selectedAnneeScolaire = anneesScolaires.find(a => a.id === selectedAnneeScolaireId);
  
  const datePickerDisabled = (currentDate: Date): boolean => {
    if (!selectedAnneeScolaire) return true; // Disable if no year selected
    return currentDate < new Date(selectedAnneeScolaire.dateDebut) || currentDate > new Date(selectedAnneeScolaire.dateFin);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la période</FormLabel>
              <FormControl>
                <Input placeholder="Trimestre 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="anneeScolaireId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année Scolaire</FormLabel>
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("dateDebut", undefined as unknown as Date); // Reset dates when year changes
                    form.setValue("dateFin", undefined as unknown as Date);
                }} 
                defaultValue={field.value} 
                disabled={anneesScolaires.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une année scolaire" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {anneesScolaires.map(annee => (
                    <SelectItem key={annee.id} value={annee.id}>{annee.annee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateDebut"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de début</FormLabel>
                <DatePicker 
                    date={field.value} 
                    setDate={field.onChange}
                    disabled={datePickerDisabled}
                />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateFin"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de fin</FormLabel>
               <DatePicker 
                date={field.value} 
                setDate={field.onChange}
                disabled={datePickerDisabled}
               />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending || !selectedAnneeScolaireId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
