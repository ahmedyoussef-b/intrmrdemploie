
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker"; 
import type { AnneeScolaire, Etablissement } from "@/types";
import { handleAddAcademicYear, type AcademicYearActionResponse } from "@/actions/academicYearActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const academicYearFormSchema = z.object({
  id: z.string().optional(),
  annee: z.string().regex(/^\d{4}-\d{4}$/, "Le format doit être AAAA-AAAA (ex: 2023-2024)."),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  dateDebut: z.date({ required_error: "La date de début est requise." }),
  dateFin: z.date({ required_error: "La date de fin est requise." }),
  estCourante: z.boolean().default(false).optional(),
}).refine(data => data.dateFin > data.dateDebut, {
  message: "La date de fin doit être postérieure à la date de début.",
  path: ["dateFin"],
});

type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>;

interface AcademicYearFormProps {
  initialData?: AnneeScolaire | null;
  etablissements: Etablissement[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AcademicYearForm({ initialData, etablissements, onSuccess, onCancel }: AcademicYearFormProps) {
  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        dateDebut: new Date(initialData.dateDebut),
        dateFin: new Date(initialData.dateFin),
    } : {
      annee: "",
      etablissementId: etablissements.length > 0 ? etablissements[0].id : "",
      dateDebut: undefined,
      dateFin: undefined,
      estCourante: false,
    },
  });

  const { toast } = useToast();
  // const actionToCall = initialData ? handleEditAcademicYear : handleAddAcademicYear; // Placeholder for edit
  const actionToCall = handleAddAcademicYear;
  const [state, formAction, isPending] = useActionState<AcademicYearActionResponse | undefined, FormData>(actionToCall, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    } else if (state?.success === false && state.message) {
      toast({
        title: "Erreur",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, onSuccess, toast]);

  function onSubmit(data: AcademicYearFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('annee', data.annee);
    formData.append('etablissementId', data.etablissementId);
    formData.append('dateDebut', data.dateDebut.toISOString());
    formData.append('dateFin', data.dateFin.toISOString());
    formData.append('estCourante', data.estCourante?.toString() || 'false');
    
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="annee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année (Format: AAAA-AAAA)</FormLabel>
              <FormControl>
                <Input placeholder="2023-2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="etablissementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Établissement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={etablissements.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un établissement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {etablissements.map(etab => (
                    <SelectItem key={etab.id} value={etab.id}>{etab.nom}</SelectItem>
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
                <DatePicker date={field.value} setDate={field.onChange} />
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
               <DatePicker date={field.value} setDate={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estCourante"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Est l'année courante ?</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
